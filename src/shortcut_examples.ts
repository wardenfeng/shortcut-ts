module feng3d.shortcut.test {

	/**
	 *
	 * @author feng 2016-4-26
	 */
	export class shortcut_examples {
		private commandDic = {};

		constructor() {

			ShortCut.init();

			this.test();
			//			test1();
			//			test2();
			//			test3(); //测试状态中&&符号
			//			test4(); //测试状态中取反符号!
			//			test5(); //测试快捷键中取反符号!
			// this.test6(); //测试状态命令，可以使用分隔符，来执行多个命令和状态命令
		}

		private test6(): void {
			var shortcuts = [ //
				{ key: "mousedown", stateCommand: "running,walking", when: "" }, //
				{ key: "mousemove", command: "run,run1", when: "running" }, //
				{ key: "mouseup", stateCommand: "!running,!walking", when: "" }, //
				{ key: "mousemove", command: "walk", when: "walking" }, //
			];
			ShortCut.addShortCuts(shortcuts);
			ShortCut.commandDispatcher.addEventListener("run", function (e: Event): void {
				console.log("接受到命令：" + e.type);
			}, this);
			ShortCut.commandDispatcher.addEventListener("run1", function (e: Event): void {
				console.log("接受到命令：" + e.type);
			}, this);
			ShortCut.commandDispatcher.addEventListener("walk", function (e: Event): void {
				console.log("接受到命令：" + e.type);
			}, this);
		}

		private test5(): void {
			var shortcuts = [ //
				{ key: "a+ ! b", command: "command_a", when: "" }, //
			];
			ShortCut.addShortCuts(shortcuts);
			ShortCut.commandDispatcher.addEventListener("command_a", function (e: Event): void {
				console.log("接受到命令：" + e.type);
			}, this);
		}

		private test4(): void {
			var shortcuts = [ //
				{ key: "a", command: "command_a", when: "" }, //
				{ key: "s", command: "command_s", when: "" }, //
				{ key: "d", command: "command_d", when: "!state_a && state_s" }, //
			];
			ShortCut.addShortCuts(shortcuts);
			ShortCut.commandDispatcher.addEventListener("command_a", function (e: Event): void {
				ShortCut.activityState("state_a");
			}, this);
			ShortCut.commandDispatcher.addEventListener("command_s", function (e: Event): void {
				ShortCut.activityState("state_s");
			}, this);
			ShortCut.commandDispatcher.addEventListener("command_d", function (e: Event): void {
				console.log("接受到命令：" + e.type);
			}, this);
		}

		private test3(): void {
			var shortcuts = [ //
				{ key: "a", command: "command_a", when: "" }, //
				{ key: "s", command: "command_s", when: "" }, //
				{ key: "d", command: "command_d", when: "state_a && state_s" }, //
			];
			ShortCut.addShortCuts(shortcuts);
			ShortCut.commandDispatcher.addEventListener("command_a", function (e: Event): void {
				ShortCut.activityState("state_a");
			}, this);
			ShortCut.commandDispatcher.addEventListener("command_s", function (e: Event): void {
				ShortCut.activityState("state_s");
			}, this);
			ShortCut.commandDispatcher.addEventListener("command_d", function (e: Event): void {
				console.log("接受到命令：" + e.type);
			}, this);
		}

		private test(): void {
			var config = ShortcutConfigJson.config;
			for (var i = 0; i < config.length; i++) {
				this.testShortcut(config[i]);
			}
		}

		private testShortcut(shortcut: any): void {
			this.commandDic[shortcut.command] = shortcut;
			ShortCut.commandDispatcher.addEventListener(shortcut.command, this.onCammandName, this);
			ShortCut.addShortCuts([shortcut]);
		}

		private onCammandName(event: Event): void {
			console.log("接受到命令：" + JSON.stringify(this.commandDic[event.type]));
		}
	}
}