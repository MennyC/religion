// AlwaysStepForFollowers.js Ver.1.0.1
// MIT License (C) 2024 あわやまたな
// http://opensource.org/licenses/mit-license.php

/*:
* @target MZ MV
* @orderBefore ReplaceTargetCharacter
* @orderBefore FesStyleFollowers
* @plugindesc Sets whether the party member always steps.
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/503002768.html
* @help Ver.1.0.1
* If you type <alwaysStep> in the actor's notes, it will always step.
* Can be canceled with plugin command.
*
* [Plugin Command (MV)]
* setAlwaysStep actorId boolean
* //Enter the actor ID in actorId and true/false in boolean.
*
* @command setAlwaysStep
* @text Set Always Step
* @desc Sets whether the actor always steps.
*
* @arg actorId
* @text Actor ID
* @type actor
* @default 1
*
* @arg bool
* @text Boolean
* @type boolean
* @default true
*
*/

/*:ja
* @target MZ MV
* @orderBefore ReplaceTargetCharacter
* @orderBefore FesStyleFollowers
* @plugindesc 特定の隊列メンバーのみ常時足踏みさせます。
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/503002768.html
* @help アクターのメモ欄に<alwaysStep>と入力すると常に足踏みするようになります。
* プラグインコマンドで解除可能。
*
* [プラグインコマンド（MV）]
* setAlwaysStep アクターID 真偽値
* //アクターIDにはアクターID、真偽値にはtrue/falseを入力します。
*
* [更新履歴]
* 2024/04/15：Ver.1.0.0　公開。
* 2024/06/05：Ver.1.0.1　コードを修正。
*
* @command setAlwaysStep
* @text 常時足踏みの設定
* @desc アクターが常時足踏みするかどうかを設定します。
*
* @arg actorId
* @text アクターID
* @type actor
* @default 1
*
* @arg bool
* @text 真偽値
* @type boolean
* @default true
*
*/

'use strict';

{

	const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];

	if (Utils.RPGMAKER_NAME === "MZ"){
		const _PluginManager = window.PluginManagerEx || PluginManager;
		const script = window.PluginManagerEx ? document.currentScript : pluginName;
		_PluginManager.registerCommand(script, "setAlwaysStep", function(args) {
			const actor = $gameActors.actor(+args.actorId);
			if (actor) {
				actor.setAlwaysStep(String(args.bool) === "true");
				$gamePlayer.refresh();
			}
		});
	}

	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.apply(this, arguments);
		if (command === "setAlwaysStep") {
			const actor = $gameActors.actor(+args[0]);
			if (character) {
				actor.setAlwaysStep(args[1] !== "false");
				$gamePlayer.refresh();
			}
		}
	};

	//-----------------------------------------------------------------------------
	// Game_Actor

	const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
	Game_Actor.prototype.initMembers = function() {
		_Game_Actor_initMembers.call(this);
		this._alwaysStep = false;
	};

	const _Game_Actor_setup = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
		_Game_Actor_setup.call(this, actorId);
		const actor = this.actor();
		this._alwaysStep = !!actor.meta && !!actor.meta.alwaysStep;
	};

	Game_Actor.prototype.alwaysStep = function() {
		return this._alwaysStep;
	};

	Game_Actor.prototype.setAlwaysStep = function(alwaysStep) {
		this._alwaysStep = alwaysStep;
	};

	//-----------------------------------------------------------------------------
	// Game_Player

	const _Game_Player_initialize = Game_Player.prototype.initialize;
	Game_Player.prototype.initialize = function() {
		_Game_Player_initialize.call(this);
		this._alwaysStep = false;
	};

	const _Game_Player_refresh  = Game_Player.prototype.refresh;
	Game_Player.prototype.refresh = function() {
		_Game_Player_refresh.call(this);
		const actor = $gameParty.leader();
		this._alwaysStep = !!actor && actor.alwaysStep();
	};

	const _Game_Player_hasStepAnime = Game_Player.prototype.hasStepAnime;
	Game_Player.prototype.hasStepAnime = function() {
		return this._alwaysStep || _Game_Player_hasStepAnime.call(this);
	};

	//-----------------------------------------------------------------------------
	// Game_Follower

	const _Game_Follower_initialize = Game_Follower.prototype.initialize;
	Game_Follower.prototype.initialize = function(memberIndex) {
		_Game_Follower_initialize.apply(this, arguments);
		this._alwaysStep = false;
	};

	const _Game_Follower_refresh = Game_Follower.prototype.refresh;
	Game_Follower.prototype.refresh = function() {
		_Game_Follower_refresh.call(this);
		this._alwaysStep = this.isVisible() && this.actor().alwaysStep();
	};

	const _Game_Follower_hasStepAnime = Game_Follower.prototype.hasStepAnime;
	Game_Follower.prototype.hasStepAnime = function() {
		return this._alwaysStep || _Game_Follower_hasStepAnime.call(this);
	};

	const _Game_Follower_update = Game_Follower.prototype.update;
	Game_Follower.prototype.update = function() {
		const alwaysStep = $gamePlayer._alwaysStep;
		$gamePlayer._alwaysStep= false;
		_Game_Follower_update.call(this);
		$gamePlayer._alwaysStep = alwaysStep;
	};

}