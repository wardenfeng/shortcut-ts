var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var feng3d;
(function (feng3d) {
    /**
     * 事件
     * @author feng 2014-5-7
     */
    var Event = (function () {
        /**
         * 创建一个作为参数传递给事件侦听器的 Event 对象。
         * @param type 事件的类型，可以作为 Event.type 访问。
         * @param data 携带数据
         * @param bubbles 确定 Event 对象是否参与事件流的冒泡阶段。默认值为 false。
         */
        function Event(type, data, bubbles) {
            if (data === void 0) { data = null; }
            if (bubbles === void 0) { bubbles = false; }
            this._type = type;
            this._bubbles = bubbles;
            this.data = data;
        }
        Object.defineProperty(Event.prototype, "isStop", {
            /**
             * 是否停止处理事件监听器
             */
            get: function () {
                return this._isStop;
            },
            set: function (value) {
                this._isStopBubbles = this._isStop = this._isStopBubbles || value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "isStopBubbles", {
            /**
             * 是否停止冒泡
             */
            get: function () {
                return this._isStopBubbles;
            },
            set: function (value) {
                this._isStopBubbles = this._isStopBubbles || value;
            },
            enumerable: true,
            configurable: true
        });
        Event.prototype.tostring = function () {
            return "[" + (typeof this) + " type=\"" + this._type + "\" bubbles=" + this._bubbles + "]";
        };
        Object.defineProperty(Event.prototype, "bubbles", {
            /**
             * 表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
             */
            get: function () {
                return this._bubbles;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "type", {
            /**
             * 事件的类型。类型区分大小写。
             */
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "target", {
            /**
             * 事件目标。
             */
            get: function () {
                return this._target;
            },
            set: function (value) {
                this._currentTarget = value;
                if (this._target == null) {
                    this._target = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "currentTarget", {
            /**
             * 当前正在使用某个事件侦听器处理 Event 对象的对象。
             */
            get: function () {
                return this._currentTarget;
            },
            enumerable: true,
            configurable: true
        });
        return Event;
    }());
    feng3d.Event = Event;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 为了实现非flash原生显示列表的冒泡事件，自定义事件适配器
     * @author feng 2016-3-22
     */
    var EventDispatcher = (function () {
        /**
         * 构建事件适配器
         * @param target		事件适配主体
         */
        function EventDispatcher(target) {
            if (target === void 0) { target = null; }
            /**
             * 冒泡属性名称为“parent”
             */
            this.bubbleAttribute = "parent";
            this.target = target;
            if (this.target == null)
                this.target = this;
        }
        /**
         * 使用 EventDispatcher 对象注册事件侦听器对象，以使侦听器能够接收事件通知。
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param thisObject                listener函数作用域
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        EventDispatcher.prototype.addEventListener = function (type, listener, thisObject, priority) {
            if (priority === void 0) { priority = 0; }
            if (listener == null)
                return;
            $listernerCenter //
                .remove(this.target, type, listener, thisObject) //
                .add(this.target, type, listener, thisObject, priority);
        };
        /**
         * 从 EventDispatcher 对象中删除侦听器. 如果没有向 IEventDispatcher 对象注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         *
         * @param type						事件的类型。
         * @param listener					要删除的侦听器对象。
         * @param thisObject                listener函数作用域
         */
        EventDispatcher.prototype.removeEventListener = function (type, listener, thisObject) {
            $listernerCenter //
                .remove(this.target, type, listener, thisObject);
        };
        /**
         * 将事件调度到事件流中. 事件目标是对其调用 dispatchEvent() 方法的 IEventDispatcher 对象。
         * @param event						调度到事件流中的 Event 对象。
         */
        EventDispatcher.prototype.dispatchEvent = function (event) {
            //设置目标
            event.target = this.target;
            var listeners = $listernerCenter.getListeners(this.target, event.type);
            //遍历调用事件回调函数
            for (var i = 0; !!listeners && i < listeners.length && !event.isStop; i++) {
                var element = listeners[i];
                element.listener.call(element.thisObject, event);
            }
            //事件冒泡(冒泡阶段)
            if (event.bubbles && !event.isStopBubbles) {
                this.dispatchBubbleEvent(event);
            }
        };
        /**
         * 检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器.
         *
         * @param type		事件的类型。
         * @return 			如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
         */
        EventDispatcher.prototype.hasEventListener = function (type) {
            var has = $listernerCenter.hasEventListener(this.target, type);
            return has;
        };
        /**
         * 销毁
         */
        EventDispatcher.prototype.destroy = function () {
            $listernerCenter.destroyDispatcherListener(this.target);
        };
        /**
         * 派发冒泡事件
         * @param event						调度到事件流中的 Event 对象。
         */
        EventDispatcher.prototype.dispatchBubbleEvent = function (event) {
            var bubbleTargets = this.getBubbleTargets(event);
            bubbleTargets && bubbleTargets.forEach(function (element) {
                element && element.dispatchEvent(event);
            });
        };
        /**
         * 获取冒泡对象
         * @param event						调度到事件流中的 Event 对象。
         */
        EventDispatcher.prototype.getBubbleTargets = function (event) {
            return [this.target[this.bubbleAttribute]];
        };
        return EventDispatcher;
    }());
    feng3d.EventDispatcher = EventDispatcher;
    /**
     * 监听数据
     */
    var ListenerVO = (function () {
        function ListenerVO() {
        }
        return ListenerVO;
    }());
    /**
     * 事件监听中心
     */
    var ListenerCenter = (function () {
        function ListenerCenter() {
            /**
             * 派发器与监听器字典
             */
            this.map = [];
        }
        /**
         * 添加监听
         * @param dispatcher 派发器
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param thisObject                listener函数作用域
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        ListenerCenter.prototype.add = function (dispatcher, type, listener, thisObject, priority) {
            if (thisObject === void 0) { thisObject = null; }
            if (priority === void 0) { priority = 0; }
            var dispatcherListener = this.getDispatcherListener(dispatcher);
            if (dispatcherListener == null) {
                dispatcherListener = this.createDispatcherListener(dispatcher);
            }
            var listeners = dispatcherListener.get(type) || [];
            this.remove(dispatcher, type, listener, thisObject);
            for (var i = 0; i < listeners.length; i++) {
                var element = listeners[i];
                if (priority > element.priority) {
                    break;
                }
            }
            listeners.splice(i, 0, { listener: listener, thisObject: thisObject, priority: priority });
            dispatcherListener.push(type, listeners);
            return this;
        };
        /**
         * 移除监听
         * @param dispatcher 派发器
         * @param type						事件的类型。
         * @param listener					要删除的侦听器对象。
         * @param thisObject                listener函数作用域
         */
        ListenerCenter.prototype.remove = function (dispatcher, type, listener, thisObject) {
            if (thisObject === void 0) { thisObject = null; }
            var dispatcherListener = this.getDispatcherListener(dispatcher);
            if (dispatcherListener == null) {
                return this;
            }
            var listeners = dispatcherListener.get(type);
            if (listeners == null) {
                return this;
            }
            for (var i = listeners.length - 1; i >= 0; i--) {
                var element = listeners[i];
                if (element.listener == listener && element.thisObject == thisObject) {
                    listeners.splice(i, 1);
                }
            }
            if (listeners.length == 0) {
                dispatcherListener.delete(type);
            }
            if (dispatcherListener.isEmpty()) {
                this.destroyDispatcherListener(dispatcher);
            }
            return this;
        };
        /**
         * 获取某类型事件的监听列表
         * @param dispatcher 派发器
         * @param type  事件类型
         */
        ListenerCenter.prototype.getListeners = function (dispatcher, type) {
            var dispatcherListener = this.getDispatcherListener(dispatcher);
            if (dispatcherListener == null) {
                return null;
            }
            return dispatcherListener.get(type);
        };
        /**
         * 判断是否有监听事件
         * @param dispatcher 派发器
         * @param type  事件类型
         */
        ListenerCenter.prototype.hasEventListener = function (dispatcher, type) {
            var dispatcherListener = this.getDispatcherListener(dispatcher);
            if (dispatcherListener == null) {
                return false;
            }
            return !!dispatcherListener.get(type);
        };
        /**
         * 创建派发器监听
         * @param dispatcher 派发器
         */
        ListenerCenter.prototype.createDispatcherListener = function (dispatcher) {
            var dispatcherListener = new Map();
            this.map.push({ dispatcher: dispatcher, listener: dispatcherListener });
            return dispatcherListener;
        };
        /**
         * 销毁派发器监听
         * @param dispatcher 派发器
         */
        ListenerCenter.prototype.destroyDispatcherListener = function (dispatcher) {
            for (var i = 0; i < this.map.length; i++) {
                var element = this.map[i];
                if (element.dispatcher == dispatcher) {
                    element.dispatcher = null;
                    element.listener.destroy();
                    element.listener = null;
                    this.map.splice(i, 1);
                    break;
                }
            }
        };
        /**
         * 获取派发器监听
         * @param dispatcher 派发器
         */
        ListenerCenter.prototype.getDispatcherListener = function (dispatcher) {
            var dispatcherListener = null;
            this.map.forEach(function (element) {
                if (element.dispatcher == dispatcher)
                    dispatcherListener = element.listener;
            });
            return dispatcherListener;
        };
        return ListenerCenter;
    }());
    /**
     * 映射
     */
    var Map = (function () {
        function Map() {
            /**
             * 映射对象
             */
            this.map = {};
        }
        /**
         * 添加对象到字典
         * @param key       键
         * @param value     值
         */
        Map.prototype.push = function (key, value) {
            this.map[key] = value;
        };
        /**
         * 删除
         * @param key       键
         */
        Map.prototype.delete = function (key) {
            delete this.map[key];
        };
        /**
         * 获取值
         * @param key       键
         */
        Map.prototype.get = function (key) {
            return this.map[key];
        };
        /**
         * 是否为空
         */
        Map.prototype.isEmpty = function () {
            return Object.keys(this.map).length == 0;
        };
        /**
         * 销毁
         */
        Map.prototype.destroy = function () {
            var keys = Object.keys(this.map);
            for (var i = 0; i < keys.length; i++) {
                var element = keys[i];
                delete this.map[element];
            }
            this.map = null;
        };
        return Map;
    }());
    /**
     * 事件监听中心
     */
    var $listernerCenter = new ListenerCenter();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var shortcut;
    (function (shortcut) {
        /**
         * 按键捕获
         * @author feng 2016-4-26
         */
        var KeyCapture = (function () {
            /**
             * 构建
             * @param stage		舞台
             */
            function KeyCapture(shortCutContext) {
                /**
                 * 捕获的按键字典
                 */
                this.mouseKeyDic = {};
                this.keyState = shortCutContext.keyState;
                //
                window.addEventListener("keydown", this.onKeydown.bind(this));
                window.addEventListener("keyup", this.onKeyup.bind(this));
                this.boardKeyDic = {};
                this.defaultSupportKeys();
                //监听鼠标事件
                var mouseEvents = [
                    "click",
                    "dblclick",
                    "mousedown",
                    "mousemove",
                    "mouseout",
                    "mouseover",
                    "mouseup",
                ];
                for (var i = 0; i < mouseEvents.length; i++) {
                    window.addEventListener(mouseEvents[i], this.onMouseOnce.bind(this));
                }
                window.addEventListener("mousewheel", this.onMousewheel.bind(this));
            }
            /**
             * 默认支持按键
             */
            KeyCapture.prototype.defaultSupportKeys = function () {
                this.boardKeyDic[17] = "ctrl";
                this.boardKeyDic[16] = "shift";
                this.boardKeyDic[32] = "escape";
                this.boardKeyDic[18] = "alt";
            };
            /**
             * 鼠标事件
             */
            KeyCapture.prototype.onMouseOnce = function (event) {
                var mouseKey = event.type;
                this.keyState.pressKey(mouseKey, event);
                this.keyState.releaseKey(mouseKey, event);
            };
            /**
             * 鼠标事件
             */
            KeyCapture.prototype.onMousewheel = function (event) {
                var mouseKey = event.type;
                this.keyState.pressKey(mouseKey, event);
                this.keyState.releaseKey(mouseKey, event);
            };
            /**
             * 键盘按下事件
             */
            KeyCapture.prototype.onKeydown = function (event) {
                var boardKey = this.getBoardKey(event.keyCode);
                if (boardKey != null)
                    this.keyState.pressKey(boardKey, event);
            };
            /**
             * 键盘弹起事件
             */
            KeyCapture.prototype.onKeyup = function (event) {
                var boardKey = this.getBoardKey(event.keyCode);
                if (boardKey)
                    this.keyState.releaseKey(boardKey, event);
            };
            /**
             * 获取键盘按键名称
             */
            KeyCapture.prototype.getBoardKey = function (keyCode) {
                var boardKey = this.boardKeyDic[keyCode];
                if (boardKey == null && 65 <= keyCode && keyCode <= 90) {
                    boardKey = String.fromCharCode(keyCode).toLocaleLowerCase();
                }
                return boardKey;
            };
            return KeyCapture;
        }());
        shortcut.KeyCapture = KeyCapture;
    })(shortcut = feng3d.shortcut || (feng3d.shortcut = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var shortcut;
    (function (shortcut) {
        /**
         * 按键状态
         * @author feng 2016-4-26
         */
        var KeyState = (function (_super) {
            __extends(KeyState, _super);
            /**
             * 构建
             */
            function KeyState() {
                _super.call(this);
                this.keyStateDic = {};
            }
            /**
             * 按下键
             * @param key 	键名称
             * @param data	携带数据
             */
            KeyState.prototype.pressKey = function (key, data) {
                if (data === void 0) { data = null; }
                this.keyStateDic[key] = true;
                this.dispatchEvent(new shortcut.ShortCutEvent(key, data));
            };
            /**
             * 释放键
             * @param key	键名称
             * @param data	携带数据
             */
            KeyState.prototype.releaseKey = function (key, data) {
                if (data === void 0) { data = null; }
                this.keyStateDic[key] = false;
                this.dispatchEvent(new shortcut.ShortCutEvent(key, data));
            };
            /**
             * 获取按键状态
             * @param key 按键名称
             */
            KeyState.prototype.getKeyState = function (key) {
                return !!this.keyStateDic[key];
            };
            return KeyState;
        }(feng3d.EventDispatcher));
        shortcut.KeyState = KeyState;
    })(shortcut = feng3d.shortcut || (feng3d.shortcut = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var shortcut;
    (function (shortcut) {
        /**
         * 快捷键捕获
         * @author feng 2016-4-26
         */
        var ShortCutCapture = (function () {
            /**
             * 构建快捷键捕获
             * @param shortCutContext		快捷键环境
             * @param key					快捷键
             * @param command				要执行的命令名称
             * @param stateCommand			可执行的状态命令
             * @param when					快捷键处于活动状态的条件
             */
            function ShortCutCapture(shortCutContext, key, command, stateCommand, when) {
                if (command === void 0) { command = null; }
                if (stateCommand === void 0) { stateCommand = null; }
                if (when === void 0) { when = null; }
                this.shortCutContext = shortCutContext;
                this.keyState = shortCutContext.keyState;
                this.key = key;
                this.command = command;
                this.stateCommand = stateCommand;
                this.when = when;
                this.keys = this.getKeys(key);
                this.states = this.getStates(when);
                this.commands = this.getCommands(command);
                this.stateCommands = this.getStateCommand(stateCommand);
                this.init();
            }
            /**
             * 初始化
             */
            ShortCutCapture.prototype.init = function () {
                for (var i = 0; i < this.keys.length; i++) {
                    this.keyState.addEventListener(this.keys[i].key, this.onCapture, this);
                }
            };
            /**
             * 处理捕获事件
             */
            ShortCutCapture.prototype.onCapture = function (event) {
                var inWhen = this.checkActivityStates(this.states);
                var pressKeys = this.checkActivityKeys(this.keys);
                if (pressKeys && inWhen) {
                    this.dispatchCommands(this.commands, event.data);
                    this.executeStateCommands(this.stateCommands);
                }
            };
            /**
             * 派发命令
             */
            ShortCutCapture.prototype.dispatchCommands = function (commands, data) {
                for (var i = 0; i < commands.length; i++) {
                    this.shortCutContext.commandDispatcher.dispatchEvent(new shortcut.ShortCutEvent(commands[i], data));
                }
            };
            /**
             * 执行状态命令
             */
            ShortCutCapture.prototype.executeStateCommands = function (stateCommands) {
                for (var i = 0; i < stateCommands.length; i++) {
                    var stateCommand = stateCommands[i];
                    if (stateCommand.not)
                        this.shortCutContext.deactivityState(stateCommand.state);
                    else
                        this.shortCutContext.activityState(stateCommand.state);
                }
            };
            /**
             * 检测快捷键是否处于活跃状态
             */
            ShortCutCapture.prototype.checkActivityStates = function (states) {
                for (var i = 0; i < states.length; i++) {
                    if (!this.getState(states[i]))
                        return false;
                }
                return true;
            };
            /**
             * 获取是否处于指定状态中（支持一个！取反）
             * @param state 状态名称
             */
            ShortCutCapture.prototype.getState = function (state) {
                var result = this.shortCutContext.getState(state.state);
                if (state.not) {
                    result = !result;
                }
                return result;
            };
            /**
             * 检测是否按下给出的键
             * @param keys 按键数组
             */
            ShortCutCapture.prototype.checkActivityKeys = function (keys) {
                for (var i = 0; i < keys.length; i++) {
                    if (!this.getKeyValue(keys[i]))
                        return false;
                }
                return true;
            };
            /**
             * 获取按键状态（true：按下状态，false：弹起状态）
             */
            ShortCutCapture.prototype.getKeyValue = function (key) {
                var value = this.keyState.getKeyState(key.key);
                if (key.not) {
                    value = !value;
                }
                return value;
            };
            /**
             * 获取状态列表
             * @param when		状态字符串
             */
            ShortCutCapture.prototype.getStates = function (when) {
                var states = [];
                if (when == null)
                    return states;
                var state = when.trim();
                if (state.length == 0) {
                    return states;
                }
                var stateStrs = state.split("+");
                for (var i = 0; i < stateStrs.length; i++) {
                    states.push(new State(stateStrs[i]));
                }
                return states;
            };
            /**
             * 获取键列表
             * @param key		快捷键
             */
            ShortCutCapture.prototype.getKeys = function (key) {
                var keyStrs = key.split("+");
                var keys = [];
                for (var i = 0; i < keyStrs.length; i++) {
                    keys.push(new Key(keyStrs[i]));
                }
                return keys;
            };
            /**
             * 获取命令列表
             * @param command	命令
             */
            ShortCutCapture.prototype.getCommands = function (command) {
                var commands = [];
                if (command == null)
                    return commands;
                command = command.trim();
                var commandStrs = command.split(",");
                for (var i = 0; i < commandStrs.length; i++) {
                    var commandStr = commandStrs[i].trim();
                    if (commandStr.length > 0) {
                        commands.push(commandStr);
                    }
                }
                return commands;
            };
            /**
             * 获取状态命令列表
             * @param stateCommand	状态命令
             */
            ShortCutCapture.prototype.getStateCommand = function (stateCommand) {
                var stateCommands = [];
                if (stateCommand == null)
                    return stateCommands;
                stateCommand = stateCommand.trim();
                var stateCommandStrs = stateCommand.split(",");
                for (var i = 0; i < stateCommandStrs.length; i++) {
                    var commandStr = stateCommandStrs[i].trim();
                    if (commandStr.length > 0) {
                        stateCommands.push(new StateCommand(commandStr));
                    }
                }
                return stateCommands;
            };
            /**
             * 销毁
             */
            ShortCutCapture.prototype.destroy = function () {
                for (var i = 0; i < this.keys.length; i++) {
                    this.keyState.removeEventListener(this.keys[i].key, this.onCapture, this);
                }
                this.shortCutContext = null;
                this.keys = null;
                this.states = null;
            };
            return ShortCutCapture;
        }());
        shortcut.ShortCutCapture = ShortCutCapture;
    })(shortcut = feng3d.shortcut || (feng3d.shortcut = {}));
})(feng3d || (feng3d = {}));
/**
 * 按键
 * @author feng 2016-6-6
 */
var Key = (function () {
    function Key(key) {
        key = key.trim();
        if (key.charAt(0) == "!") {
            this.not = true;
            key = key.substr(1).trim();
        }
        this.key = key;
    }
    return Key;
}());
/**
 * 状态
 * @author feng 2016-6-6
 */
var State = (function () {
    function State(state) {
        state = state.trim();
        if (state.charAt(0) == "!") {
            this.not = true;
            state = state.substr(1).trim();
        }
        this.state = state;
    }
    return State;
}());
/**
 * 状态命令
 * @author feng 2016-6-6
 */
var StateCommand = (function () {
    function StateCommand(state) {
        state = state.trim();
        if (state.charAt(0) == "!") {
            this.not = true;
            state = state.substr(1).trim();
        }
        this.state = state;
    }
    return StateCommand;
}());
var feng3d;
(function (feng3d) {
    var shortcut;
    (function (shortcut_1) {
        /**
         * 快捷键环境
         * @author feng 2016-6-6
         */
        var ShortCutContext = (function () {
            /**
             * 构建快捷键环境
             * @param stage 舞台
             */
            function ShortCutContext() {
                this.init();
            }
            /**
             * 初始化快捷键模块
             */
            ShortCutContext.prototype.init = function () {
                this.keyState = new shortcut_1.KeyState();
                this.keyCapture = new shortcut_1.KeyCapture(this);
                this.commandDispatcher = new feng3d.EventDispatcher();
                this.captureDic = {};
                this.stateDic = {};
            };
            /**
             * 添加快捷键
             * @param shortcuts		快捷键列表
             */
            ShortCutContext.prototype.addShortCuts = function (shortcuts) {
                for (var i = 0; i < shortcuts.length; i++) {
                    var shortcut = shortcuts[i];
                    var shortcutUniqueKey = this.getShortcutUniqueKey(shortcut);
                    this.captureDic[shortcutUniqueKey] = this.captureDic[shortcutUniqueKey] || new shortcut_1.ShortCutCapture(this, shortcut.key, shortcut.command, shortcut.stateCommand, shortcut.when);
                }
            };
            /**
             * 删除快捷键
             * @param shortcuts		快捷键列表
             */
            ShortCutContext.prototype.removeShortCuts = function (shortcuts) {
                for (var i = 0; i < shortcuts.length; i++) {
                    var shortcutUniqueKey = this.getShortcutUniqueKey(shortcuts[i]);
                    var shortCutCapture = this.captureDic[shortcutUniqueKey];
                    if (shortcut_1.ShortCutCapture != null) {
                        shortCutCapture.destroy();
                    }
                    delete this.captureDic[shortcutUniqueKey];
                }
            };
            /**
             * 移除所有快捷键
             */
            ShortCutContext.prototype.removeAllShortCuts = function () {
                var _this = this;
                var keys = [];
                var key;
                for (key in this.captureDic) {
                    keys.push(key);
                }
                keys.forEach(function (key) {
                    var shortCutCapture = _this.captureDic[key];
                    shortCutCapture.destroy();
                    delete _this.captureDic[key];
                });
            };
            /**
             * 激活状态
             * @param state 状态名称
             */
            ShortCutContext.prototype.activityState = function (state) {
                this.stateDic[state] = true;
            };
            /**
             * 取消激活状态
             * @param state 状态名称
             */
            ShortCutContext.prototype.deactivityState = function (state) {
                delete this.stateDic[state];
            };
            /**
             * 获取状态
             * @param state 状态名称
             */
            ShortCutContext.prototype.getState = function (state) {
                return !!this.stateDic[state];
            };
            /**
             * 获取快捷键唯一字符串
             */
            ShortCutContext.prototype.getShortcutUniqueKey = function (shortcut) {
                return shortcut.key + "," + shortcut.command + "," + shortcut.when;
            };
            return ShortCutContext;
        }());
        shortcut_1.ShortCutContext = ShortCutContext;
    })(shortcut = feng3d.shortcut || (feng3d.shortcut = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var shortcut;
    (function (shortcut) {
        /**
         * 快捷键命令事件
         * @author feng 2016-4-27
         */
        var ShortCutEvent = (function (_super) {
            __extends(ShortCutEvent, _super);
            /**
             * 构建
             * @param command		命令名称
             */
            function ShortCutEvent(command, data) {
                if (data === void 0) { data = null; }
                _super.call(this, command, data);
            }
            return ShortCutEvent;
        }(feng3d.Event));
        shortcut.ShortCutEvent = ShortCutEvent;
    })(shortcut = feng3d.shortcut || (feng3d.shortcut = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var shortcut;
    (function (shortcut) {
        /**
         * 初始化快捷键模块
         * @author feng 2016-4-26
         *
         * <pre>
    var shortcuts:Array = [ //
    //在按下key1时触发命令command1
        {key: "key1", command: "command1", when: ""}, //
         //在按下key1时触发状态命令改变stateCommand1为激活状态
        {key: "key1", stateCommand: "stateCommand1", when: "state1"}, //
         //处于state1状态时按下key1触发命令command1
        {key: "key1", command: "command1", when: "state1"}, //
        //处于state1状态不处于state2时按下key1与没按下key2触发command1与command2，改变stateCommand1为激活状态，stateCommand2为非激活状态
        {key: "key1+ ! key2", command: "command1,command2", stateCommand: "stateCommand1,!stateCommand2", when: "state1+!state2"}, //
        ];
    //添加快捷键
    ShortCut.addShortCuts(shortcuts);
    //监听命令
    ShortCut.commandDispatcher.addEventListener("run", function(e:Event):void
    {
        trace("接受到命令：" + e.type);
    });
         * </pre>
         */
        var ShortCut = (function () {
            function ShortCut() {
            }
            /**
             * 初始化快捷键模块
             */
            ShortCut.init = function () {
                ShortCut.shortcutContext = new shortcut.ShortCutContext();
                ShortCut.commandDispatcher = ShortCut.shortcutContext.commandDispatcher;
            };
            /**
             * 添加快捷键
             * @param shortcuts		快捷键列表
             */
            ShortCut.addShortCuts = function (shortcuts) {
                ShortCut.shortcutContext.addShortCuts(shortcuts);
            };
            /**
             * 删除快捷键
             * @param shortcuts		快捷键列表
             */
            ShortCut.removeShortCuts = function (shortcuts) {
                ShortCut.shortcutContext.removeShortCuts(shortcuts);
            };
            /**
             * 移除所有快捷键
             */
            ShortCut.removeAllShortCuts = function () {
                ShortCut.shortcutContext.removeAllShortCuts();
            };
            /**
             * 激活状态
             * @param state 状态名称
             */
            ShortCut.activityState = function (state) {
                ShortCut.shortcutContext.activityState(state);
            };
            /**
             * 取消激活状态
             * @param state 状态名称
             */
            ShortCut.deactivityState = function (state) {
                ShortCut.shortcutContext.deactivityState(state);
            };
            /**
             * 获取状态
             * @param state 状态名称
             */
            ShortCut.getState = function (state) {
                return ShortCut.shortcutContext.getState(state);
            };
            return ShortCut;
        }());
        shortcut.ShortCut = ShortCut;
    })(shortcut = feng3d.shortcut || (feng3d.shortcut = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var shortcut;
    (function (shortcut) {
        var test;
        (function (test) {
            /**
             *
             * @author feng 2016-4-27
             */
            var ShortcutConfigJson = (function () {
                function ShortcutConfigJson() {
                }
                // 通过将键绑定放入键绑定文件中来覆盖键绑定。
                ShortcutConfigJson.config = [
                    { "key": "shift+escape", "command": "closeReferenceSearchEditor", "when": "editorFocus && inReferenceSearchEditor" },
                    { "key": "escape", "command": "closeReferenceSearchEditor", "when": "editorFocus && inReferenceSearchEditor" },
                    { "key": "shift+escape", "command": "cancelSelection", "when": "editorTextFocus && editorHasSelection" },
                    { "key": "escape", "command": "cancelSelection", "when": "editorTextFocus && editorHasSelection" },
                    { "key": "ctrl+end", "command": "cursorBottom", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+end", "command": "cursorBottomSelect", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+alt+down", "command": "cursorColumnSelectDown", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+alt+left", "command": "cursorColumnSelectLeft", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+alt+pagedown", "command": "cursorColumnSelectPageDown", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+alt+pageup", "command": "cursorColumnSelectPageUp", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+alt+right", "command": "cursorColumnSelectRight", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+alt+up", "command": "cursorColumnSelectUp", "when": "editorTextFocus" },
                    { "key": "down", "command": "cursorDown", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+down", "command": "cursorDownSelect", "when": "editorTextFocus" },
                    { "key": "shift+down", "command": "cursorDownSelect", "when": "editorTextFocus" },
                    { "key": "end", "command": "cursorEnd", "when": "editorTextFocus" },
                    { "key": "shift+end", "command": "cursorEndSelect", "when": "editorTextFocus" },
                    { "key": "home", "command": "cursorHome", "when": "editorTextFocus" },
                    { "key": "shift+home", "command": "cursorHomeSelect", "when": "editorTextFocus" },
                    { "key": "left", "command": "cursorLeft", "when": "editorTextFocus" },
                    { "key": "shift+left", "command": "cursorLeftSelect", "when": "editorTextFocus" },
                    { "key": "pagedown", "command": "cursorPageDown", "when": "editorTextFocus" },
                    { "key": "shift+pagedown", "command": "cursorPageDownSelect", "when": "editorTextFocus" },
                    { "key": "pageup", "command": "cursorPageUp", "when": "editorTextFocus" },
                    { "key": "shift+pageup", "command": "cursorPageUpSelect", "when": "editorTextFocus" },
                    { "key": "right", "command": "cursorRight", "when": "editorTextFocus" },
                    { "key": "shift+right", "command": "cursorRightSelect", "when": "editorTextFocus" },
                    { "key": "ctrl+home", "command": "cursorTop", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+home", "command": "cursorTopSelect", "when": "editorTextFocus" },
                    { "key": "ctrl+u", "command": "cursorUndo", "when": "editorTextFocus" },
                    { "key": "up", "command": "cursorUp", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+up", "command": "cursorUpSelect", "when": "editorTextFocus" },
                    { "key": "shift+up", "command": "cursorUpSelect", "when": "editorTextFocus" },
                    { "key": "ctrl+right", "command": "cursorWordEndRight", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+right", "command": "cursorWordEndRightSelect", "when": "editorTextFocus" },
                    { "key": "ctrl+left", "command": "cursorWordStartLeft", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+left", "command": "cursorWordStartLeftSelect", "when": "editorTextFocus" },
                    { "key": "shift+backspace", "command": "deleteLeft", "when": "editorTextFocus" },
                    { "key": "backspace", "command": "deleteLeft", "when": "editorTextFocus" },
                    { "key": "delete", "command": "deleteRight", "when": "editorTextFocus" },
                    { "key": "ctrl+backspace", "command": "deleteWordLeft", "when": "editorTextFocus" },
                    { "key": "ctrl+delete", "command": "deleteWordRight", "when": "editorTextFocus" },
                    { "key": "ctrl+a", "command": "editor.action.selectAll" },
                    { "key": "ctrl+i", "command": "expandLineSelection", "when": "editorTextFocus" },
                    { "key": "shift+tab", "command": "outdent", "when": "editorTextFocus && !editorTabMovesFocus" },
                    { "key": "ctrl+shift+z", "command": "redo", "when": "editorTextFocus" },
                    { "key": "ctrl+y", "command": "redo", "when": "editorTextFocus" },
                    { "key": "ctrl+down", "command": "scrollLineDown", "when": "editorTextFocus" },
                    { "key": "ctrl+up", "command": "scrollLineUp", "when": "editorTextFocus" },
                    { "key": "ctrl+pagedown", "command": "scrollPageDown", "when": "editorTextFocus" },
                    { "key": "ctrl+pageup", "command": "scrollPageUp", "when": "editorTextFocus" },
                    { "key": "tab", "command": "tab", "when": "editorTextFocus && !editorTabMovesFocus" },
                    { "key": "ctrl+z", "command": "undo", "when": "editorTextFocus" },
                    { "key": "shift+escape", "command": "removeSecondaryCursors", "when": "editorTextFocus && editorHasMultipleSelections" },
                    { "key": "escape", "command": "removeSecondaryCursors", "when": "editorTextFocus && editorHasMultipleSelections" },
                    { "key": "ctrl+f", "command": "actions.find" },
                    { "key": "ctrl+k ctrl+c", "command": "editor.action.addCommentLine", "when": "editorTextFocus" },
                    { "key": "ctrl+d", "command": "editor.action.addSelectionToNextFindMatch", "when": "editorFocus" },
                    { "key": "shift+alt+a", "command": "editor.action.blockComment", "when": "editorTextFocus" },
                    { "key": "ctrl+f2", "command": "editor.action.changeAll", "when": "editorTextFocus" },
                    { "key": "ctrl+insert", "command": "editor.action.clipboardCopyAction" },
                    { "key": "ctrl+c", "command": "editor.action.clipboardCopyAction" },
                    { "key": "shift+delete", "command": "editor.action.clipboardCutAction" },
                    { "key": "ctrl+x", "command": "editor.action.clipboardCutAction" },
                    { "key": "shift+insert", "command": "editor.action.clipboardPasteAction" },
                    { "key": "ctrl+v", "command": "editor.action.clipboardPasteAction" },
                    { "key": "ctrl+/", "command": "editor.action.commentLine", "when": "editorTextFocus" },
                    { "key": "shift+alt+down", "command": "editor.action.copyLinesDownAction", "when": "editorTextFocus" },
                    { "key": "shift+alt+up", "command": "editor.action.copyLinesUpAction", "when": "editorTextFocus" },
                    { "key": "ctrl+k ctrl+k", "command": "editor.action.defineKeybinding", "when": "editorFocus" },
                    { "key": "ctrl+shift+k", "command": "editor.action.deleteLines", "when": "editorTextFocus" },
                    { "key": "shift+alt+f", "command": "editor.action.format", "when": "editorTextFocus" },
                    { "key": "f12", "command": "editor.action.goToDeclaration", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+.", "command": "editor.action.inPlaceReplace.down", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+,", "command": "editor.action.inPlaceReplace.up", "when": "editorTextFocus" },
                    { "key": "ctrl+]", "command": "editor.action.indentLines", "when": "editorTextFocus" },
                    { "key": "ctrl+alt+up", "command": "editor.action.insertCursorAbove", "when": "editorTextFocus" },
                    { "key": "shift+alt+i", "command": "editor.action.insertCursorAtEndOfEachLineSelected", "when": "editorTextFocus" },
                    { "key": "ctrl+alt+down", "command": "editor.action.insertCursorBelow", "when": "editorTextFocus" },
                    { "key": "ctrl+enter", "command": "editor.action.insertLineAfter", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+enter", "command": "editor.action.insertLineBefore", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+\\", "command": "editor.action.jumpToBracket", "when": "editorTextFocus" },
                    { "key": "f8", "command": "editor.action.marker.next", "when": "editorFocus" },
                    { "key": "shift+f8", "command": "editor.action.marker.prev", "when": "editorFocus" },
                    { "key": "alt+down", "command": "editor.action.moveLinesDownAction", "when": "editorTextFocus" },
                    { "key": "alt+up", "command": "editor.action.moveLinesUpAction", "when": "editorTextFocus" },
                    { "key": "ctrl+k ctrl+d", "command": "editor.action.moveSelectionToNextFindMatch", "when": "editorFocus" },
                    { "key": "f3", "command": "editor.action.nextMatchFindAction", "when": "editorFocus" },
                    { "key": "ctrl+f3", "command": "editor.action.nextSelectionMatchFindAction", "when": "editorFocus" },
                    { "key": "ctrl+k f12", "command": "editor.action.openDeclarationToTheSide", "when": "editorTextFocus" },
                    { "key": "ctrl+[", "command": "editor.action.outdentLines", "when": "editorTextFocus" },
                    { "key": "alt+f12", "command": "editor.action.previewDeclaration", "when": "editorTextFocus" },
                    { "key": "shift+f3", "command": "editor.action.previousMatchFindAction", "when": "editorFocus" },
                    { "key": "ctrl+shift+f3", "command": "editor.action.previousSelectionMatchFindAction", "when": "editorFocus" },
                    { "key": "ctrl+.", "command": "editor.action.quickFix", "when": "editorTextFocus" },
                    { "key": "shift+f12", "command": "editor.action.referenceSearch.trigger", "when": "editorTextFocus" },
                    { "key": "ctrl+k ctrl+u", "command": "editor.action.removeCommentLine", "when": "editorTextFocus" },
                    { "key": "f2", "command": "editor.action.rename", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+l", "command": "editor.action.selectHighlights", "when": "editorFocus" },
                    { "key": "alt+f1", "command": "editor.action.showAccessibilityHelp", "when": "editorFocus" },
                    { "key": "shift+f10", "command": "editor.action.showContextMenu", "when": "editorTextFocus" },
                    { "key": "ctrl+k ctrl+i", "command": "editor.action.showHover", "when": "editorTextFocus" },
                    { "key": "shift+alt+right", "command": "editor.action.smartSelect.grow", "when": "editorTextFocus" },
                    { "key": "shift+alt+left", "command": "editor.action.smartSelect.shrink", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+2", "command": "editor.action.sortLinesAscending", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+3", "command": "editor.action.sortLinesDescending", "when": "editorTextFocus" },
                    { "key": "ctrl+h", "command": "editor.action.startFindReplaceAction" },
                    { "key": "ctrl+m", "command": "editor.action.toggleTabFocusMode", "when": "editorTextFocus" },
                    { "key": "alt+z", "command": "editor.action.toggleWordWrap", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+space", "command": "editor.action.triggerParameterHints", "when": "editorTextFocus" },
                    { "key": "ctrl+space", "command": "editor.action.triggerSuggest", "when": "editorTextFocus" },
                    { "key": "ctrl+shift+x", "command": "editor.action.trimTrailingWhitespace", "when": "editorTextFocus" },
                    { "key": "ctrl+k ctrl+i", "command": "editor.debug.action.showDebugHover", "when": "inDebugMode && editorTextFocus" },
                    { "key": "f9", "command": "editor.debug.action.toggleBreakpoint", "when": "editorTextFocus" },
                    { "key": "tab", "command": "editor.emmet.action.expandAbbreviation", "when": "editorTextFocus && !editorHasSelection && !editorHasMultipleSelections && !editorTabMovesFocus" },
                    { "key": "ctrl+shift+[", "command": "editor.fold", "when": "editorFocus" },
                    { "key": "ctrl+shift+alt+[", "command": "editor.foldAll", "when": "editorFocus" },
                    { "key": "ctrl+k ctrl+1", "command": "editor.foldLevel1", "when": "editorFocus" },
                    { "key": "ctrl+k ctrl+2", "command": "editor.foldLevel2", "when": "editorFocus" },
                    { "key": "ctrl+k ctrl+3", "command": "editor.foldLevel3", "when": "editorFocus" },
                    { "key": "ctrl+k ctrl+4", "command": "editor.foldLevel4", "when": "editorFocus" },
                    { "key": "ctrl+k ctrl+5", "command": "editor.foldLevel5", "when": "editorFocus" },
                    { "key": "ctrl+shift+]", "command": "editor.unfold", "when": "editorFocus" },
                    { "key": "ctrl+k ctrl+j", "command": "editor.unfoldAll", "when": "editorFocus" },
                    { "key": "ctrl+shift+alt+]", "command": "editor.unfoldAll", "when": "editorFocus" },
                    { "key": "shift+escape", "command": "closeFindWidget", "when": "editorFocus && findWidgetVisible" },
                    { "key": "escape", "command": "closeFindWidget", "when": "editorFocus && findWidgetVisible" },
                    { "key": "ctrl+alt+enter", "command": "editor.action.replaceAll", "when": "editorFocus" },
                    { "key": "ctrl+shift+1", "command": "editor.action.replaceOne", "when": "editorFocus" },
                    { "key": "alt+c", "command": "toggleFindCaseSensitive", "when": "editorFocus" },
                    { "key": "alt+r", "command": "toggleFindRegex", "when": "editorFocus" },
                    { "key": "alt+w", "command": "toggleFindWholeWord", "when": "editorFocus" },
                    { "key": "shift+escape", "command": "closeBreakpointWidget", "when": "editorFocus && breakpointWidgetVisible" },
                    { "key": "escape", "command": "closeBreakpointWidget", "when": "editorFocus && breakpointWidgetVisible" },
                    { "key": "enter", "command": "acceptSnippet", "when": "editorTextFocus && inSnippetMode" },
                    { "key": "tab", "command": "jumpToNextSnippetPlaceholder", "when": "editorTextFocus && inSnippetMode" },
                    { "key": "shift+tab", "command": "jumpToPrevSnippetPlaceholder", "when": "editorTextFocus && inSnippetMode" },
                    { "key": "shift+escape", "command": "leaveSnippet", "when": "editorTextFocus && inSnippetMode" },
                    { "key": "escape", "command": "leaveSnippet", "when": "editorTextFocus && inSnippetMode" },
                    { "key": "shift+escape", "command": "closeMarkersNavigation", "when": "editorFocus && markersNavigationVisible" },
                    { "key": "escape", "command": "closeMarkersNavigation", "when": "editorFocus && markersNavigationVisible" },
                    { "key": "shift+escape", "command": "closeReferenceSearch", "when": "editorFocus && referenceSearchVisible" },
                    { "key": "escape", "command": "closeReferenceSearch", "when": "editorFocus && referenceSearchVisible" },
                    { "key": "shift+escape", "command": "closeParameterHints", "when": "editorTextFocus && parameterHintsVisible" },
                    { "key": "escape", "command": "closeParameterHints", "when": "editorTextFocus && parameterHintsVisible" },
                    { "key": "alt+down", "command": "showNextParameterHint", "when": "editorTextFocus && parameterHintsVisible" },
                    { "key": "down", "command": "showNextParameterHint", "when": "editorTextFocus && parameterHintsVisible" },
                    { "key": "alt+up", "command": "showPrevParameterHint", "when": "editorTextFocus && parameterHintsVisible" },
                    { "key": "up", "command": "showPrevParameterHint", "when": "editorTextFocus && parameterHintsVisible" },
                    { "key": "tab", "command": "acceptQuickFixSuggestion", "when": "editorFocus && quickFixWidgetVisible" },
                    { "key": "enter", "command": "acceptQuickFixSuggestion", "when": "editorFocus && quickFixWidgetVisible" },
                    { "key": "shift+escape", "command": "closeQuickFixWidget", "when": "editorFocus && quickFixWidgetVisible" },
                    { "key": "escape", "command": "closeQuickFixWidget", "when": "editorFocus && quickFixWidgetVisible" },
                    { "key": "pagedown", "command": "selectNextPageQuickFix", "when": "editorFocus && quickFixWidgetVisible" },
                    { "key": "down", "command": "selectNextQuickFix", "when": "editorFocus && quickFixWidgetVisible" },
                    { "key": "pageup", "command": "selectPrevPageQuickFix", "when": "editorFocus && quickFixWidgetVisible" },
                    { "key": "up", "command": "selectPrevQuickFix", "when": "editorFocus && quickFixWidgetVisible" },
                    { "key": "tab", "command": "acceptSelectedSuggestion", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "enter", "command": "acceptSelectedSuggestionOnEnter", "when": "suggestWidgetVisible && config.editor.acceptSuggestionOnEnter" },
                    { "key": "shift+escape", "command": "hideSuggestWidget", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "escape", "command": "hideSuggestWidget", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "alt+pagedown", "command": "selectNextPageSuggestion", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "pagedown", "command": "selectNextPageSuggestion", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "alt+down", "command": "selectNextSuggestion", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "down", "command": "selectNextSuggestion", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "alt+pageup", "command": "selectPrevPageSuggestion", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "pageup", "command": "selectPrevPageSuggestion", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "alt+up", "command": "selectPrevSuggestion", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "up", "command": "selectPrevSuggestion", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "ctrl+space", "command": "toggleSuggestionDetails", "when": "editorTextFocus && suggestWidgetVisible" },
                    { "key": "enter", "command": "acceptRenameInput", "when": "editorFocus && renameInputVisible" },
                    { "key": "shift+escape", "command": "cancelRenameInput", "when": "editorFocus && renameInputVisible" },
                    { "key": "escape", "command": "cancelRenameInput", "when": "editorFocus && renameInputVisible" },
                    { "key": "shift+escape", "command": "closeAccessibilityHelp", "when": "editorFocus && accessibilityHelpWidgetVisible" },
                    { "key": "escape", "command": "closeAccessibilityHelp", "when": "editorFocus && accessibilityHelpWidgetVisible" },
                    { "key": "ctrl+shift+r", "command": "toggleExperimentalScreenReaderSupport" },
                    { "key": "ctrl+w", "command": "workbench.action.closeActiveEditor" },
                    { "key": "ctrl+f4", "command": "workbench.action.closeActiveEditor" },
                    { "key": "ctrl+k f", "command": "workbench.action.closeFolder" },
                    { "key": "shift+escape", "command": "workbench.action.closeMessages", "when": "globalMessageVisible" },
                    { "key": "escape", "command": "workbench.action.closeMessages", "when": "globalMessageVisible" },
                    { "key": "ctrl+shift+w", "command": "workbench.action.closeWindow" },
                    { "key": "ctrl+k ctrl+right", "command": "workbench.action.compareEditor.nextChange", "when": "textCompareEditorVisible" },
                    { "key": "ctrl+k ctrl+left", "command": "workbench.action.compareEditor.previousChange", "when": "textCompareEditorVisible" },
                    { "key": "ctrl+`", "command": "workbench.action.cycleEditor" },
                    { "key": "f5", "command": "workbench.action.debug.continue", "when": "inDebugMode" },
                    { "key": "ctrl+shift+f5", "command": "workbench.action.debug.restart", "when": "inDebugMode" },
                    { "key": "ctrl+f5", "command": "workbench.action.debug.run", "when": "!inDebugMode" },
                    { "key": "f5", "command": "workbench.action.debug.start", "when": "!inDebugMode" },
                    { "key": "shift+f11", "command": "workbench.action.debug.stepOut", "when": "inDebugMode" },
                    { "key": "f10", "command": "workbench.action.debug.stepOver", "when": "inDebugMode" },
                    { "key": "shift+f5", "command": "workbench.action.debug.stop", "when": "inDebugMode" },
                    { "key": "ctrl+k m", "command": "workbench.action.editor.changeLanguageMode" },
                    { "key": "ctrl+k p", "command": "workbench.action.files.copyPathOfActiveFile" },
                    { "key": "ctrl+n", "command": "workbench.action.files.newUntitledFile" },
                    { "key": "ctrl+o", "command": "workbench.action.files.openFile" },
                    { "key": "ctrl+k r", "command": "workbench.action.files.revealActiveFileInWindows" },
                    { "key": "ctrl+s", "command": "workbench.action.files.save" },
                    { "key": "ctrl+shift+s", "command": "workbench.action.files.saveAs" },
                    { "key": "ctrl+k o", "command": "workbench.action.files.showOpenedFileInNewWindow" },
                    { "key": "ctrl+1", "command": "workbench.action.focusFirstEditor" },
                    { "key": "ctrl+alt+left", "command": "workbench.action.focusLeftEditor" },
                    { "key": "ctrl+alt+right", "command": "workbench.action.focusRightEditor" },
                    { "key": "ctrl+2", "command": "workbench.action.focusSecondEditor" },
                    { "key": "ctrl+0", "command": "workbench.action.focusSideBar" },
                    { "key": "ctrl+3", "command": "workbench.action.focusThirdEditor" },
                    { "key": "ctrl+g", "command": "workbench.action.gotoLine" },
                    { "key": "ctrl+shift+o", "command": "workbench.action.gotoSymbol" },
                    { "key": "ctrl+k v", "command": "workbench.action.markdown.openPreviewSideBySide" },
                    { "key": "ctrl+shift+v", "command": "workbench.action.markdown.togglePreview" },
                    { "key": "ctrl+k left", "command": "workbench.action.moveActiveEditorLeft" },
                    { "key": "ctrl+k right", "command": "workbench.action.moveActiveEditorRight" },
                    { "key": "alt+left", "command": "workbench.action.navigateBack" },
                    { "key": "alt+right", "command": "workbench.action.navigateForward" },
                    { "key": "ctrl+shift+n", "command": "workbench.action.newWindow" },
                    { "key": "ctrl+shift+tab", "command": "workbench.action.openPreviousEditor" },
                    { "key": "ctrl+tab", "command": "workbench.action.openPreviousEditor" },
                    { "key": "ctrl+shift+u", "command": "workbench.action.output.toggleOutput" },
                    { "key": "ctrl+e", "command": "workbench.action.quickOpen" },
                    { "key": "ctrl+p", "command": "workbench.action.quickOpen" },
                    { "key": "ctrl+tab", "command": "workbench.action.quickOpenNavigateNext", "when": "inQuickOpen" },
                    { "key": "ctrl+e", "command": "workbench.action.quickOpenNavigateNext", "when": "inQuickOpen" },
                    { "key": "ctrl+p", "command": "workbench.action.quickOpenNavigateNext", "when": "inQuickOpen" },
                    { "key": "ctrl+shift+j", "command": "workbench.action.search.toggleQueryDetails", "when": "searchViewletVisible" },
                    { "key": "ctrl+t", "command": "workbench.action.showAllSymbols" },
                    { "key": "f1", "command": "workbench.action.showCommands" },
                    { "key": "ctrl+shift+p", "command": "workbench.action.showCommands" },
                    { "key": "ctrl+shift+m", "command": "workbench.action.showErrorsWarnings" },
                    { "key": "ctrl+\\", "command": "workbench.action.splitEditor" },
                    { "key": "ctrl+shift+b", "command": "workbench.action.tasks.build" },
                    { "key": "ctrl+shift+t", "command": "workbench.action.tasks.test" },
                    { "key": "ctrl+shift+c", "command": "workbench.action.terminal.openNativeConsole" },
                    { "key": "f11", "command": "workbench.action.toggleFullScreen" },
                    { "key": "ctrl+j", "command": "workbench.action.togglePanel" },
                    { "key": "ctrl+b", "command": "workbench.action.toggleSidebarVisibility" },
                    { "key": "ctrl+=", "command": "workbench.action.zoomIn" },
                    { "key": "ctrl+-", "command": "workbench.action.zoomOut" },
                    { "key": "ctrl+shift+y", "command": "workbench.debug.action.toggleRepl" },
                    { "key": "ctrl+k enter", "command": "workbench.files.action.addToWorkingFiles" },
                    { "key": "ctrl+k ctrl+w", "command": "workbench.files.action.closeAllFiles" },
                    { "key": "ctrl+k w", "command": "workbench.files.action.closeFile" },
                    { "key": "ctrl+k ctrl+shift+w", "command": "workbench.files.action.closeOtherFiles" },
                    { "key": "ctrl+k e", "command": "workbench.files.action.focusWorkingFiles" },
                    { "key": "ctrl+k down", "command": "workbench.files.action.openNextWorkingFile" },
                    { "key": "ctrl+k up", "command": "workbench.files.action.openPreviousWorkingFile" },
                    { "key": "ctrl+k ctrl+p", "command": "workbench.files.action.workingFilesPicker" },
                    { "key": "ctrl+shift+d", "command": "workbench.view.debug" },
                    { "key": "ctrl+shift+e", "command": "workbench.view.explorer" },
                    { "key": "ctrl+shift+g", "command": "workbench.view.git" },
                    { "key": "ctrl+shift+f", "command": "workbench.view.search" },
                    { "key": "f11", "command": "workbench.action.debug.stepInto", "when": "inDebugMode" },
                    { "key": "ctrl+shift+tab", "command": "workbench.action.quickOpenNavigatePrevious", "when": "inQuickOpen" },
                    { "key": "ctrl+shift+e", "command": "workbench.action.quickOpenNavigatePrevious", "when": "inQuickOpen" },
                    { "key": "ctrl+shift+p", "command": "workbench.action.quickOpenNavigatePrevious", "when": "inQuickOpen" },
                    { "key": ".", "command": "^acceptSelectedSuggestion", "when": "editorTextFocus && suggestWidgetVisible && editorLangId == 'typescript' && suggestionSupportsAcceptOnKey" } //
                ];
                return ShortcutConfigJson;
            }());
            test.ShortcutConfigJson = ShortcutConfigJson;
        })(test = shortcut.test || (shortcut.test = {}));
    })(shortcut = feng3d.shortcut || (feng3d.shortcut = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var shortcut;
    (function (shortcut_2) {
        var test;
        (function (test) {
            /**
             *
             * @author feng 2016-4-26
             */
            var shortcut_examples = (function () {
                function shortcut_examples() {
                    this.commandDic = {};
                    shortcut_2.ShortCut.init();
                    this.test();
                    //			test1();
                    //			test2();
                    //			test3(); //测试状态中&&符号
                    //			test4(); //测试状态中取反符号!
                    //			test5(); //测试快捷键中取反符号!
                    // this.test6(); //测试状态命令，可以使用分隔符，来执行多个命令和状态命令
                }
                shortcut_examples.prototype.test6 = function () {
                    var shortcuts = [
                        { key: "mousedown", stateCommand: "running,walking", when: "" },
                        { key: "mousemove", command: "run,run1", when: "running" },
                        { key: "mouseup", stateCommand: "!running,!walking", when: "" },
                        { key: "mousemove", command: "walk", when: "walking" },
                    ];
                    shortcut_2.ShortCut.addShortCuts(shortcuts);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("run", function (e) {
                        console.log("接受到命令：" + e.type);
                    }, this);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("run1", function (e) {
                        console.log("接受到命令：" + e.type);
                    }, this);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("walk", function (e) {
                        console.log("接受到命令：" + e.type);
                    }, this);
                };
                shortcut_examples.prototype.test5 = function () {
                    var shortcuts = [
                        { key: "a+ ! b", command: "command_a", when: "" },
                    ];
                    shortcut_2.ShortCut.addShortCuts(shortcuts);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("command_a", function (e) {
                        console.log("接受到命令：" + e.type);
                    }, this);
                };
                shortcut_examples.prototype.test4 = function () {
                    var shortcuts = [
                        { key: "a", command: "command_a", when: "" },
                        { key: "s", command: "command_s", when: "" },
                        { key: "d", command: "command_d", when: "!state_a && state_s" },
                    ];
                    shortcut_2.ShortCut.addShortCuts(shortcuts);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("command_a", function (e) {
                        shortcut_2.ShortCut.activityState("state_a");
                    }, this);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("command_s", function (e) {
                        shortcut_2.ShortCut.activityState("state_s");
                    }, this);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("command_d", function (e) {
                        console.log("接受到命令：" + e.type);
                    }, this);
                };
                shortcut_examples.prototype.test3 = function () {
                    var shortcuts = [
                        { key: "a", command: "command_a", when: "" },
                        { key: "s", command: "command_s", when: "" },
                        { key: "d", command: "command_d", when: "state_a && state_s" },
                    ];
                    shortcut_2.ShortCut.addShortCuts(shortcuts);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("command_a", function (e) {
                        shortcut_2.ShortCut.activityState("state_a");
                    }, this);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("command_s", function (e) {
                        shortcut_2.ShortCut.activityState("state_s");
                    }, this);
                    shortcut_2.ShortCut.commandDispatcher.addEventListener("command_d", function (e) {
                        console.log("接受到命令：" + e.type);
                    }, this);
                };
                shortcut_examples.prototype.test = function () {
                    var config = test.ShortcutConfigJson.config;
                    for (var i = 0; i < config.length; i++) {
                        this.testShortcut(config[i]);
                    }
                };
                shortcut_examples.prototype.testShortcut = function (shortcut) {
                    this.commandDic[shortcut.command] = shortcut;
                    shortcut_2.ShortCut.commandDispatcher.addEventListener(shortcut.command, this.onCammandName, this);
                    shortcut_2.ShortCut.addShortCuts([shortcut]);
                };
                shortcut_examples.prototype.onCammandName = function (event) {
                    console.log("接受到命令：" + JSON.stringify(this.commandDic[event.type]));
                };
                return shortcut_examples;
            }());
            test.shortcut_examples = shortcut_examples;
        })(test = shortcut_2.test || (shortcut_2.test = {}));
    })(shortcut = feng3d.shortcut || (feng3d.shortcut = {}));
})(feng3d || (feng3d = {}));
new feng3d.shortcut.test.shortcut_examples();
//# sourceMappingURL=index.js.map