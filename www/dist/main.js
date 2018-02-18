/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(7);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
Imba is the namespace for all runtime related utilities
@namespace
*/

var Imba = {VERSION: '1.3.0-beta.12'};

/*

Light wrapper around native setTimeout that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after the timeout to let schedulers update (to rerender etc) afterwards.

*/

Imba.setTimeout = function (delay,block){
	return setTimeout(function() {
		block();
		return Imba.commit();
	},delay);
};

/*

Light wrapper around native setInterval that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after every interval to let schedulers update (to rerender etc) afterwards.

*/

Imba.setInterval = function (interval,block){
	return setInterval(block,interval);
};

/*
Clear interval with specified id
*/

Imba.clearInterval = function (id){
	return clearInterval(id);
};

/*
Clear timeout with specified id
*/

Imba.clearTimeout = function (id){
	return clearTimeout(id);
};


Imba.subclass = function (obj,sup){
	for (let k in sup){
		let v;
		v = sup[k];if (sup.hasOwnProperty(k)) { obj[k] = v };
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.initialize = obj.prototype.constructor = obj;
	return obj;
};

/*
Lightweight method for making an object iterable in imbas for/in loops.
If the compiler cannot say for certain that a target in a for loop is an
array, it will cache the iterable version before looping.

```imba
# this is the whole method
def Imba.iterable o
	return o ? (o:toArray ? o.toArray : o) : []

class CustomIterable
	def toArray
		[1,2,3]

# will return [2,4,6]
for x in CustomIterable.new
	x * 2

```
*/

Imba.iterable = function (o){
	return o ? ((o.toArray ? o.toArray() : o)) : [];
};

/*
Coerces a value into a promise. If value is array it will
call `Promise.all(value)`, or if it is not a promise it will
wrap the value in `Promise.resolve(value)`. Used for experimental
await syntax.
@return {Promise}
*/

Imba.await = function (value){
	if (value instanceof Array) {
		console.warn("await (Array) is deprecated - use await Promise.all(Array)");
		return Promise.all(value);
	} else if (value && value.then) {
		return value;
	} else {
		return Promise.resolve(value);
	};
};

var dashRegex = /-./g;
var setterCache = {};

Imba.toCamelCase = function (str){
	if (str.indexOf('-') >= 0) {
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		return str;
	};
};

Imba.toSetter = function (str){
	return setterCache[str] || (setterCache[str] = Imba.toCamelCase('set-' + str));
};

Imba.indexOf = function (a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};

Imba.len = function (a){
	return a && ((a.len instanceof Function) ? a.len.call(a) : a.length) || 0;
};

Imba.prop = function (scope,name,opts){
	if (scope.defineProperty) {
		return scope.defineProperty(name,opts);
	};
	return;
};

Imba.attr = function (scope,name,opts){
	if(opts === undefined) opts = {};
	if (scope.defineAttribute) {
		return scope.defineAttribute(name,opts);
	};
	
	let getName = Imba.toCamelCase(name);
	let setName = Imba.toCamelCase('set-' + name);
	let proto = scope.prototype;
	
	if (opts.dom) {
		proto[getName] = function() { return this.dom()[name]; };
		proto[setName] = function(value) {
			if (value != this[name]()) {
				this.dom()[name] = value;
			};
			return this;
		};
	} else {
		proto[getName] = function() { return this.getAttribute(name); };
		proto[setName] = function(value) {
			this.setAttribute(name,value);
			return this;
		};
	};
	return;
};

Imba.propDidSet = function (object,property,val,prev){
	let fn = property.watch;
	if (fn instanceof Function) {
		fn.call(object,val,prev,property);
	} else if ((typeof fn=='string'||fn instanceof String) && object[fn]) {
		object[fn](val,prev,property);
	};
	return;
};


// Basic events
function emit__(event,args,node){
	// var node = cbs[event]
	var prev,cb,ret;
	
	while ((prev = node) && (node = node.next)){
		if (cb = node.listener) {
			if (node.path && cb[node.path]) {
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
			} else {
				// check if it is a method?
				ret = args ? cb.apply(node,args) : cb.call(node);
			};
		};
		
		if (node.times && --node.times <= 0) {
			prev.next = node.next;
			node.listener = null;
		};
	};
	return;
};

// method for registering a listener on object
Imba.listen = function (obj,event,listener,path){
	var cbs,list,tail;
	cbs = obj.__listeners__ || (obj.__listeners__ = {});
	list = cbs[event] || (cbs[event] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.listener = listener;
	tail.path = path;
	list.tail = tail.next = {};
	return tail;
};

// register a listener once
Imba.once = function (obj,event,listener){
	var tail = Imba.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};

// remove a listener
Imba.unlisten = function (obj,event,cb,meth){
	var node,prev;
	var meta = obj.__listeners__;
	if (!(meta)) { return };
	
	if (node = meta[event]) {
		while ((prev = node) && (node = node.next)){
			if (node == cb || node.listener == cb) {
				prev.next = node.next;
				// check for correct path as well?
				node.listener = null;
				break;
			};
		};
	};
	return;
};

// emit event
Imba.emit = function (obj,event,params){
	var cb;
	if (cb = obj.__listeners__) {
		if (cb[event]) { emit__(event,params,cb[event]) };
		if (cb.all) { emit__(event,[event,params],cb.all) }; // and event != 'all'
	};
	return;
};

Imba.observeProperty = function (observer,key,trigger,target,prev){
	if (prev && typeof prev == 'object') {
		Imba.unlisten(prev,'all',observer,trigger);
	};
	if (target && typeof target == 'object') {
		Imba.listen(target,'all',observer,trigger);
	};
	return this;
};

module.exports = Imba;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Page = Imba.defineTag('Page')
exports.Page = Page;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

Imba.Pointer = function Pointer(){
	this._button = -1;
	this._event = {x: 0,y: 0,type: 'uninitialized'};
	return this;
};

Imba.Pointer.prototype.button = function (){
	return this._button;
};

Imba.Pointer.prototype.touch = function (){
	return this._touch;
};

Imba.Pointer.prototype.update = function (e){
	this._event = e;
	this._dirty = true;
	return this;
};

// this is just for regular mouse now
Imba.Pointer.prototype.process = function (){
	var e1 = this._event;
	
	if (this._dirty) {
		this._prevEvent = e1;
		this._dirty = false;
		
		// button should only change on mousedown etc
		if (e1.type == 'mousedown') {
			this._button = e1.button;
			
			if ((this._touch && this._button != 0)) {
				return;
			};
			
			// cancel the previous touch
			if (this._touch) { this._touch.cancel() };
			this._touch = new Imba.Touch(e1,this);
			this._touch.mousedown(e1,e1);
		} else if (e1.type == 'mousemove') {
			if (this._touch) { this._touch.mousemove(e1,e1) };
		} else if (e1.type == 'mouseup') {
			this._button = -1;
			
			if (this._touch && this._touch.button() == e1.button) {
				this._touch.mouseup(e1,e1);
				this._touch = null;
			};
			// trigger pointerup
		};
	} else if (this._touch) {
		this._touch.idle();
	};
	return this;
};

Imba.Pointer.prototype.x = function (){
	return this._event.x;
};
Imba.Pointer.prototype.y = function (){
	return this._event.y;
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
// externs;

var Snippet = Imba.defineTag('Snippet', function(tag){
	tag.prototype.src = function(v){ return this._src; }
	tag.prototype.setSrc = function(v){ this._src = v; return this; };
	tag.prototype.heading = function(v){ return this._heading; }
	tag.prototype.setHeading = function(v){ this._heading = v; return this; };
	tag.prototype.hl = function(v){ return this._hl; }
	tag.prototype.setHl = function(v){ this._hl = v; return this; };
	
	tag.replace = function (dom){
		let imba = dom.firstChild;
		let js = imba.nextSibling;
		let highlighted = imba.innerHTML;
		let raw = dom.textContent;
		let data = {
			code: raw,
			html: highlighted,
			js: {
				code: js.textContent,
				html: js.innerHTML
			}
		};
		
		let snippet = (_1(Snippet)).setData(data).end();
		dom.parentNode.replaceChild(snippet.dom(),dom);
		return snippet;
	};
	
	tag.prototype.setup = function (){
		this.render();
		this._code.dom().innerHTML = this.data().html;
		this.run();
		return this;
	};
	
	tag.prototype.run = function (){
		var self = this;
		var orig = Imba.mount;
		
		// var js = 'var require = function(){ return Imba };\n' + data:js:code
		var js = self.data().js.code;
		console.log(Imba);
		js = js.replace("require('imba')",'window.Imba');
		try {
			Imba.mount = function(item) { return orig.call(Imba,item,self._result.dom()); };
			console.log("run code",js);
			eval(js);
		} catch (e) { };
		
		Imba.mount = orig;
		return self;
	};
	
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('snippet').setChildren($.$ = $.$ || [
			this._code = this._code||_1('code',this).flag('code'),
			this._result = this._result||_1('div',this).flag('result').flag('styled-example')
		],2).synced();
	};
})
exports.Snippet = Snippet;

var Example = Imba.defineTag('Example', Snippet, function(tag){
	
	tag.prototype.render = function (){
		return this.$open(0).setText("Example").synced();
	};
})
exports.Example = Example;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(6);
module.exports = __webpack_require__(27);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;

var App = __webpack_require__(17).App;
var Site = __webpack_require__(19).Site;
document.body.innerHTML = '';
Imba.mount((_1(Site)).setData(APP = App.deserialize(APPCACHE)).end());


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);
var activate = false;
if (typeof window !== 'undefined') {
	if (window.Imba) {
		console.warn(("Imba v" + (window.Imba.VERSION) + " is already loaded."));
		Imba = window.Imba;
	} else {
		window.Imba = Imba;
		activate = true;
		if (window.define && window.define.amd) {
			window.define("imba",[],function() { return Imba; });
		};
	};
};

module.exports = Imba;

if (true) {
	__webpack_require__(8);
	__webpack_require__(9);
};

if (true && activate) {
	Imba.EventManager.activate();
};

if (false) {};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var requestAnimationFrame; // very simple raf polyfill
var cancelAnimationFrame;

if (false) {};

if (true) {
	cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitRequestAnimationFrame;
	requestAnimationFrame = window.requestAnimationFrame;
	requestAnimationFrame || (requestAnimationFrame = window.webkitRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = window.mozRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = function(blk) { return setTimeout(blk,1000 / 60); });
};

function Ticker(){
	var self = this;
	self._queue = [];
	self._stage = -1;
	self._scheduled = false;
	self._ticker = function(e) {
		self._scheduled = false;
		return self.tick(e);
	};
	self;
};

Ticker.prototype.stage = function(v){ return this._stage; }
Ticker.prototype.setStage = function(v){ this._stage = v; return this; };
Ticker.prototype.queue = function(v){ return this._queue; }
Ticker.prototype.setQueue = function(v){ this._queue = v; return this; };

Ticker.prototype.add = function (item,force){
	if (force || this._queue.indexOf(item) == -1) {
		this._queue.push(item);
	};
	
	if (!this._scheduled) { return this.schedule() };
};

Ticker.prototype.tick = function (timestamp){
	var items = this._queue;
	if (!this._ts) { this._ts = timestamp };
	this._dt = timestamp - this._ts;
	this._ts = timestamp;
	this._queue = [];
	this._stage = 1;
	this.before();
	if (items.length) {
		for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (item instanceof Function) {
				item(this._dt,this);
			} else if (item.tick) {
				item.tick(this._dt,this);
			};
		};
	};
	this._stage = 2;
	this.after();
	this._stage = this._scheduled ? 0 : (-1);
	return this;
};

Ticker.prototype.schedule = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		if (this._stage == -1) {
			this._stage = 0;
		};
		requestAnimationFrame(this._ticker);
	};
	return this;
};

Ticker.prototype.before = function (){
	return this;
};

Ticker.prototype.after = function (){
	if (Imba.TagManager) {
		Imba.TagManager.refresh();
	};
	return this;
};

Imba.TICKER = new Ticker();
Imba.SCHEDULERS = [];

Imba.ticker = function (){
	return Imba.TICKER;
};

Imba.requestAnimationFrame = function (callback){
	return requestAnimationFrame(callback);
};

Imba.cancelAnimationFrame = function (id){
	return cancelAnimationFrame(id);
};

// should add an Imba.run / setImmediate that
// pushes listener onto the tick-queue with times - once

var commitQueue = 0;

Imba.commit = function (params){
	commitQueue++;
	// Imba.TagManager.refresh
	Imba.emit(Imba,'commit',(params != undefined) ? [params] : undefined);
	if (--commitQueue == 0) {
		Imba.TagManager && Imba.TagManager.refresh();
	};
	return;
};

/*

Instances of Imba.Scheduler manages when to call `tick()` on their target,
at a specified framerate or when certain events occur. Root-nodes in your
applications will usually have a scheduler to make sure they rerender when
something changes. It is also possible to make inner components use their
own schedulers to control when they render.

@iname scheduler

*/

Imba.Scheduler = function Scheduler(target){
	var self = this;
	self._id = counter++;
	self._target = target;
	self._marked = false;
	self._active = false;
	self._marker = function() { return self.mark(); };
	self._ticker = function(e) { return self.tick(e); };
	
	self._dt = 0;
	self._frame = {};
	self._scheduled = false;
	self._timestamp = 0;
	self._ticks = 0;
	self._flushes = 0;
	
	self.onevent = self.onevent.bind(self);
	self;
};

var counter = 0;

Imba.Scheduler.event = function (e){
	return Imba.emit(Imba,'event',e);
};

/*
	Create a new Imba.Scheduler for specified target
	@return {Imba.Scheduler}
	*/

Imba.Scheduler.prototype.__raf = {watch: 'rafDidSet',name: 'raf'};
Imba.Scheduler.prototype.raf = function(v){ return this._raf; }
Imba.Scheduler.prototype.setRaf = function(v){
	var a = this.raf();
	if(v != a) { this._raf = v; }
	if(v != a) { this.rafDidSet && this.rafDidSet(v,a,this.__raf) }
	return this;
};
Imba.Scheduler.prototype.__interval = {watch: 'intervalDidSet',name: 'interval'};
Imba.Scheduler.prototype.interval = function(v){ return this._interval; }
Imba.Scheduler.prototype.setInterval = function(v){
	var a = this.interval();
	if(v != a) { this._interval = v; }
	if(v != a) { this.intervalDidSet && this.intervalDidSet(v,a,this.__interval) }
	return this;
};
Imba.Scheduler.prototype.__events = {watch: 'eventsDidSet',name: 'events'};
Imba.Scheduler.prototype.events = function(v){ return this._events; }
Imba.Scheduler.prototype.setEvents = function(v){
	var a = this.events();
	if(v != a) { this._events = v; }
	if(v != a) { this.eventsDidSet && this.eventsDidSet(v,a,this.__events) }
	return this;
};
Imba.Scheduler.prototype.marked = function(v){ return this._marked; }
Imba.Scheduler.prototype.setMarked = function(v){ this._marked = v; return this; };

Imba.Scheduler.prototype.rafDidSet = function (bool){
	if (bool && this._active) this.requestTick();
	return this;
};

Imba.Scheduler.prototype.intervalDidSet = function (time){
	clearInterval(this._intervalId);
	this._intervalId = null;
	if (time && this._active) {
		this._intervalId = setInterval(this.oninterval.bind(this),time);
	};
	return this;
};

Imba.Scheduler.prototype.eventsDidSet = function (new$,prev){
	if (this._active && new$ && !(prev)) {
		return Imba.listen(Imba,'commit',this,'onevent');
	} else if (!(new$) && prev) {
		return Imba.unlisten(Imba,'commit',this,'onevent');
	};
};

/*
	Check whether the current scheduler is active or not
	@return {bool}
	*/

Imba.Scheduler.prototype.active = function (){
	return this._active;
};

/*
	Delta time between the two last ticks
	@return {Number}
	*/

Imba.Scheduler.prototype.dt = function (){
	return this._dt;
};

/*
	Configure the scheduler
	@return {self}
	*/

Imba.Scheduler.prototype.configure = function (options){
	var v_;
	if(options === undefined) options = {};
	if (options.raf != undefined) { (this.setRaf(v_ = options.raf),v_) };
	if (options.interval != undefined) { (this.setInterval(v_ = options.interval),v_) };
	if (options.events != undefined) { (this.setEvents(v_ = options.events),v_) };
	return this;
};

/*
	Mark the scheduler as dirty. This will make sure that
	the scheduler calls `target.tick` on the next frame
	@return {self}
	*/

Imba.Scheduler.prototype.mark = function (){
	this._marked = true;
	if (!this._scheduled) {
		this.requestTick();
	};
	return this;
};

/*
	Instantly trigger target.tick and mark scheduler as clean (not dirty/marked).
	This is called implicitly from tick, but can also be called manually if you
	really want to force a tick without waiting for the next frame.
	@return {self}
	*/

Imba.Scheduler.prototype.flush = function (){
	this._flushes++;
	this._target.tick(this);
	this._marked = false;
	return this;
};

/*
	@fixme this expects raf to run at 60 fps 

	Called automatically on every frame while the scheduler is active.
	It will only call `target.tick` if the scheduler is marked dirty,
	or when according to @fps setting.

	If you have set up a scheduler with an fps of 1, tick will still be
	called every frame, but `target.tick` will only be called once every
	second, and it will *make sure* each `target.tick` happens in separate
	seconds according to Date. So if you have a node that renders a clock
	based on Date.now (or something similar), you can schedule it with 1fps,
	never needing to worry about two ticks happening within the same second.
	The same goes for 4fps, 10fps etc.

	@protected
	@return {self}
	*/

Imba.Scheduler.prototype.tick = function (delta,ticker){
	this._ticks++;
	this._dt = delta;
	
	if (ticker) {
		this._scheduled = false;
	};
	
	this.flush();
	
	if (this._raf && this._active) {
		this.requestTick();
	};
	return this;
};

Imba.Scheduler.prototype.requestTick = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		Imba.TICKER.add(this);
	};
	return this;
};

/*
	Start the scheduler if it is not already active.
	**While active**, the scheduler will override `target.commit`
	to do nothing. By default Imba.tag#commit calls render, so
	that rendering is cascaded through to children when rendering
	a node. When a scheduler is active (for a node), Imba disables
	this automatic rendering.
	*/

Imba.Scheduler.prototype.activate = function (immediate){
	if(immediate === undefined) immediate = true;
	if (!this._active) {
		this._active = true;
		this._commit = this._target.commit;
		this._target.commit = function() { return this; };
		this._target && this._target.flag  &&  this._target.flag('scheduled_');
		Imba.SCHEDULERS.push(this);
		
		if (this._events) {
			Imba.listen(Imba,'commit',this,'onevent');
		};
		
		if (this._interval && !this._intervalId) {
			this._intervalId = setInterval(this.oninterval.bind(this),this._interval);
		};
		
		if (immediate) {
			this.tick(0);
		} else if (this._raf) {
			this.requestTick();
		};
	};
	return this;
};

/*
	Stop the scheduler if it is active.
	*/

Imba.Scheduler.prototype.deactivate = function (){
	if (this._active) {
		this._active = false;
		this._target.commit = this._commit;
		let idx = Imba.SCHEDULERS.indexOf(this);
		if (idx >= 0) {
			Imba.SCHEDULERS.splice(idx,1);
		};
		
		if (this._events) {
			Imba.unlisten(Imba,'commit',this,'onevent');
		};
		
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = null;
		};
		
		this._target && this._target.unflag  &&  this._target.unflag('scheduled_');
	};
	return this;
};

Imba.Scheduler.prototype.track = function (){
	return this._marker;
};

Imba.Scheduler.prototype.oninterval = function (){
	this.tick();
	Imba.TagManager.refresh();
	return this;
};

Imba.Scheduler.prototype.onevent = function (event){
	if (!this._events || this._marked) { return this };
	
	if (this._events instanceof Function) {
		if (this._events(event,this)) this.mark();
	} else if (this._events instanceof Array) {
		if (this._events.indexOf((event && event.type) || event) >= 0) {
			this.mark();
		};
	} else {
		this.mark();
	};
	return this;
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(10);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(11);
__webpack_require__(12);
__webpack_require__(3);
__webpack_require__(13);
__webpack_require__(14);
__webpack_require__(15);

if (true) {
	__webpack_require__(16);
};

if (false) {};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.TagManagerClass = function TagManagerClass(){
	this._inserts = 0;
	this._removes = 0;
	this._mounted = [];
	this._hasMountables = false;
	this;
};

Imba.TagManagerClass.prototype.mounted = function (){
	return this._mounted;
};

Imba.TagManagerClass.prototype.insert = function (node,parent){
	return this._inserts++;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	return this._removes++;
};

Imba.TagManagerClass.prototype.changes = function (){
	return this._inserts + this._removes;
};

Imba.TagManagerClass.prototype.mount = function (node){
	if (false) {};
	return this._hasMountables = true;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	if (false) {};
	if (!(force) && this.changes() == 0) { return };
	// console.time('resolveMounts')
	if ((this._inserts && this._hasMountables) || force) {
		this.tryMount();
	};
	
	if ((this._removes || force) && this._mounted.length) {
		this.tryUnmount();
	};
	// console.timeEnd('resolveMounts')
	this._inserts = 0;
	this._removes = 0;
	return this;
};

Imba.TagManagerClass.prototype.unmount = function (node){
	return this;
};

Imba.TagManagerClass.prototype.tryMount = function (){
	var count = 0;
	var root = document.body;
	var items = root.querySelectorAll('.__mount');
	// what if we end up creating additional mountables by mounting?
	for (let i = 0, ary = iter$(items), len = ary.length, el; i < len; i++) {
		el = ary[i];
		if (el && el._tag) {
			if (this._mounted.indexOf(el._tag) == -1) {
				this.mountNode(el._tag);
			};
		};
	};
	return this;
};

Imba.TagManagerClass.prototype.mountNode = function (node){
	this._mounted.push(node);
	node.FLAGS |= Imba.TAG_MOUNTED;
	if (node.mount) { node.mount() };
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	var count = 0;
	var root = document.body;
	for (let i = 0, items = iter$(this._mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!document.documentElement.contains(item._dom)) {
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item._dom) {
				item.unmount();
			} else if (item._scheduler) {
				// MAYBE FIX THIS?
				item.unschedule();
			};
			this._mounted[i] = null;
			count++;
		};
	};
	
	if (count) {
		this._mounted = this._mounted.filter(function(item) { return item; });
	};
	return this;
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.CSSKeyMap = {};

Imba.TAG_BUILT = 1;
Imba.TAG_SETUP = 2;
Imba.TAG_MOUNTING = 4;
Imba.TAG_MOUNTED = 8;
Imba.TAG_SCHEDULED = 16;
Imba.TAG_AWAKENED = 32;

/*
Get the current document
*/

Imba.document = function (){
	if (true) {
		return window.document;
	};
};

/*
Get the body element wrapped in an Imba.Tag
*/

Imba.root = function (){
	return Imba.getTagForDom(Imba.document().body);
};

Imba.static = function (items,typ,nr){
	items._type = typ;
	items.static = nr;
	return items;
};

/*

*/

Imba.mount = function (node,into){
	into || (into = Imba.document().body);
	into.appendChild(node.dom());
	Imba.TagManager.insert(node,into);
	node.scheduler().configure({events: true}).activate(false);
	Imba.TagManager.refresh();
	return node;
};


Imba.createTextNode = function (node){
	if (node && node.nodeType == 3) {
		return node;
	};
	return Imba.document().createTextNode(node);
};

/*
This is the baseclass that all tags in imba inherit from.
@iname node
*/

Imba.Tag = function Tag(dom,ctx){
	this.setDom(dom);
	this.$ = TagCache.build(this);
	this.$up = this._owner_ = ctx;
	this._tree_ = null;
	this.FLAGS = 0;
	this.build();
	this;
};

Imba.Tag.buildNode = function (){
	var dom = Imba.document().createElement(this._nodeType || 'div');
	if (this._classes) {
		var cls = this._classes.join(" ");
		if (cls) { dom.className = cls };
	};
	return dom;
};

Imba.Tag.createNode = function (){
	var proto = (this._protoDom || (this._protoDom = this.buildNode()));
	return proto.cloneNode(false);
};

Imba.Tag.build = function (ctx){
	return new this(this.createNode(),ctx);
};

Imba.Tag.dom = function (){
	return this._protoDom || (this._protoDom = this.buildNode());
};

/*
	Called when a tag type is being subclassed.
	*/

Imba.Tag.inherit = function (child){
	child._protoDom = null;
	
	if (this._nodeType) {
		child._nodeType = this._nodeType;
		child._classes = this._classes.slice();
		
		if (child._flagName) {
			return child._classes.push(child._flagName);
		};
	} else {
		child._nodeType = child._name;
		child._flagName = null;
		return child._classes = [];
	};
};

/*
	Internal method called after a tag class has
	been declared or extended.
	
	@private
	*/

Imba.Tag.prototype.optimizeTagStructure = function (){
	var base = Imba.Tag.prototype;
	var hasSetup = this.setup != base.setup;
	var hasCommit = this.commit != base.commit;
	var hasRender = this.render != base.render;
	var hasMount = this.mount;
	
	var ctor = this.constructor;
	
	if (hasCommit || hasRender || hasMount || hasSetup) {
		
		this.end = function() {
			if (this.mount && !(this.FLAGS & Imba.TAG_MOUNTED)) {
				// just activate 
				Imba.TagManager.mount(this);
			};
			
			if (!(this.FLAGS & Imba.TAG_SETUP)) {
				this.FLAGS |= Imba.TAG_SETUP;
				this.setup();
			};
			
			this.commit();
			
			return this;
		};
	};
	
	if (true) {
		if (hasMount) {
			if (ctor._classes && ctor._classes.indexOf('__mount') == -1) {
				ctor._classes.push('__mount');
			};
			
			if (ctor._protoDom) {
				ctor._protoDom.classList.add('__mount');
			};
		};
		
		for (let i = 0, items = ['mousemove','mouseenter','mouseleave','mouseover','mouseout','selectstart'], len = items.length, item; i < len; i++) {
			item = items[i];
			if (this[("on" + item)]) { Imba.Events.register(item) };
		};
	};
	return this;
};


Imba.attr(Imba.Tag,'name');
Imba.attr(Imba.Tag,'role');
Imba.attr(Imba.Tag,'tabindex');
Imba.Tag.prototype.title = function(v){ return this.getAttribute('title'); }
Imba.Tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };

Imba.Tag.prototype.dom = function (){
	return this._dom;
};

Imba.Tag.prototype.setDom = function (dom){
	dom._tag = this;
	this._dom = dom;
	return this;
};

Imba.Tag.prototype.ref = function (){
	return this._ref;
};

Imba.Tag.prototype.root = function (){
	return this._owner_ ? this._owner_.root() : this;
};

/*
	Setting references for tags like
	`<div@header>` will compile to `tag('div').ref_('header',this).end()`
	By default it adds the reference as a className to the tag.

	@return {self}
	@private
	*/

Imba.Tag.prototype.ref_ = function (ref){
	this.flag(this._ref = ref);
	return this;
};

/*
	Set the data object for node
	@return {self}
	*/

Imba.Tag.prototype.setData = function (data){
	this._data = data;
	return this;
};

/*
	Get the data object for node
	*/

Imba.Tag.prototype.data = function (){
	return this._data;
};


Imba.Tag.prototype.bindData = function (target,path,args){
	return this.setData(args ? target[path].apply(target,args) : target[path]);
};

/*
	Set inner html of node
	*/

Imba.Tag.prototype.setHtml = function (html){
	if (this.html() != html) {
		this._dom.innerHTML = html;
	};
	return this;
};

/*
	Get inner html of node
	*/

Imba.Tag.prototype.html = function (){
	return this._dom.innerHTML;
};

Imba.Tag.prototype.on$ = function (slot,handler,context){
	let handlers = this._on_ || (this._on_ = []);
	let prev = handlers[slot];
	// self-bound handlers
	if (slot < 0) {
		if (prev == undefined) {
			slot = handlers[slot] = handlers.length;
		} else {
			slot = prev;
		};
		prev = handlers[slot];
	};
	
	handlers[slot] = handler;
	if (prev) {
		handler.state = prev.state;
	} else {
		handler.state = {context: context};
	};
	return this;
};


Imba.Tag.prototype.setId = function (id){
	if (id != null) {
		this.dom().id = id;
	};
	return this;
};

Imba.Tag.prototype.id = function (){
	return this.dom().id;
};

/*
	Adds a new attribute or changes the value of an existing attribute
	on the specified tag. If the value is null or false, the attribute
	will be removed.
	@return {self}
	*/

Imba.Tag.prototype.setAttribute = function (name,value){
	var old = this.dom().getAttribute(name);
	
	if (old == value) {
		value;
	} else if (value != null && value !== false) {
		this.dom().setAttribute(name,value);
	} else {
		this.dom().removeAttribute(name);
	};
	return this;
};

Imba.Tag.prototype.setNestedAttr = function (ns,name,value){
	if (this[ns + 'SetAttribute']) {
		this[ns + 'SetAttribute'](name,value);
	} else {
		this.setAttributeNS(ns,name,value);
	};
	return this;
};

Imba.Tag.prototype.setAttributeNS = function (ns,name,value){
	var old = this.getAttributeNS(ns,name);
	
	if (old != value) {
		if (value != null && value !== false) {
			this.dom().setAttributeNS(ns,name,value);
		} else {
			this.dom().removeAttributeNS(ns,name);
		};
	};
	return this;
};


/*
	removes an attribute from the specified tag
	*/

Imba.Tag.prototype.removeAttribute = function (name){
	return this.dom().removeAttribute(name);
};

/*
	returns the value of an attribute on the tag.
	If the given attribute does not exist, the value returned
	will either be null or "" (the empty string)
	*/

Imba.Tag.prototype.getAttribute = function (name){
	return this.dom().getAttribute(name);
};


Imba.Tag.prototype.getAttributeNS = function (ns,name){
	return this.dom().getAttributeNS(ns,name);
};


Imba.Tag.prototype.set = function (key,value,mods){
	let setter = Imba.toSetter(key);
	if (this[setter] instanceof Function) {
		this[setter](value,mods);
	} else {
		this._dom.setAttribute(key,value);
	};
	return this;
};


Imba.Tag.prototype.get = function (key){
	return this._dom.getAttribute(key);
};

/*
	Override this to provide special wrapping etc.
	@return {self}
	*/

Imba.Tag.prototype.setContent = function (content,type){
	this.setChildren(content,type);
	return this;
};

/*
	Set the children of node. type param is optional,
	and should only be used by Imba when compiling tag trees. 
	@return {self}
	*/

Imba.Tag.prototype.setChildren = function (nodes,type){
	// overridden on client by reconciler
	this._tree_ = nodes;
	return this;
};

/*
	Set the template that will render the content of node.
	@return {self}
	*/

Imba.Tag.prototype.setTemplate = function (template){
	if (!this._template) {
		// override the basic
		if (this.render == Imba.Tag.prototype.render) {
			this.render = this.renderTemplate; // do setChildren(renderTemplate)
		};
		this.optimizeTagStructure();
	};
	
	this.template = this._template = template;
	return this;
};

Imba.Tag.prototype.template = function (){
	return null;
};

/*
	If no custom render-method is defined, and the node
	has a template, this method will be used to render
	@return {self}
	*/

Imba.Tag.prototype.renderTemplate = function (){
	var body = this.template();
	if (body != this) { this.setChildren(body) };
	return this;
};


/*
	Remove specified child from current node.
	@return {self}
	*/

Imba.Tag.prototype.removeChild = function (child){
	var par = this.dom();
	var el = child._dom || child;
	if (el && el.parentNode == par) {
		par.removeChild(el);
		Imba.TagManager.remove(el._tag || el,this);
	};
	return this;
};

/*
	Remove all content inside node
	*/

Imba.Tag.prototype.removeAllChildren = function (){
	if (this._dom.firstChild) {
		while (this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		Imba.TagManager.remove(null,this); // should register each child?
	};
	this._tree_ = this._text_ = null;
	return this;
};

/*
	Append a single item (node or string) to the current node.
	If supplied item is a string it will automatically. This is used
	by Imba internally, but will practically never be used explicitly.
	@return {self}
	*/

Imba.Tag.prototype.appendChild = function (node){
	if ((typeof node=='string'||node instanceof String)) {
		this.dom().appendChild(Imba.document().createTextNode(node));
	} else if (node) {
		this.dom().appendChild(node._dom || node);
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};

/*
	Insert a node into the current node (self), before another.
	The relative node must be a child of current node. 
	*/

Imba.Tag.prototype.insertBefore = function (node,rel){
	if ((typeof node=='string'||node instanceof String)) {
		node = Imba.document().createTextNode(node);
	};
	
	if (node && rel) {
		this.dom().insertBefore((node._dom || node),(rel._dom || rel));
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};


/*
	Remove node from the dom tree
	@return {self}
	*/

Imba.Tag.prototype.orphanize = function (){
	var par;
	if (par = this.parent()) { par.removeChild(this) };
	return this;
};

/*
	Get text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	@return {string} inner text of node
	*/

Imba.Tag.prototype.text = function (v){
	return this._dom.textContent;
};

/*
	Set text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	*/

Imba.Tag.prototype.setText = function (txt){
	this._tree_ = txt;
	this._dom.textContent = (txt == null || this.text() === false) ? '' : txt;
	this;
	return this;
};


/*
	Method for getting and setting data-attributes. When called with zero
	arguments it will return the actual dataset for the tag.

		var node = <div data-name='hello'>
		# get the whole dataset
		node.dataset # {name: 'hello'}
		# get a single value
		node.dataset('name') # 'hello'
		# set a single value
		node.dataset('name','newname') # self


	*/

Imba.Tag.prototype.dataset = function (key,val){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.dataset(k,v);
		};
		return this;
	};
	
	if (arguments.length == 2) {
		this.setAttribute(("data-" + key),val);
		return this;
	};
	
	if (key) {
		return this.getAttribute(("data-" + key));
	};
	
	var dataset = this.dom().dataset;
	
	if (!(dataset)) {
		dataset = {};
		for (let i = 0, items = iter$(this.dom().attributes), len = items.length, atr; i < len; i++) {
			atr = items[i];
			if (atr.name.substr(0,5) == 'data-') {
				dataset[Imba.toCamelCase(atr.name.slice(5))] = atr.value;
			};
		};
	};
	
	return dataset;
};

/*
	Empty placeholder. Override to implement custom render behaviour.
	Works much like the familiar render-method in React.
	@return {self}
	*/

Imba.Tag.prototype.render = function (){
	return this;
};

/*
	Called implicitly while tag is initializing. No initial props
	will have been set at this point.
	@return {self}
	*/

Imba.Tag.prototype.build = function (){
	return this;
};

/*
	Called once, implicitly through Imba.Tag#end. All initial props
	and children will have been set before setup is called.
	setContent.
	@return {self}
	*/

Imba.Tag.prototype.setup = function (){
	return this;
};

/*
	Called implicitly through Imba.Tag#end, for tags that are part of
	a tag tree (that are rendered several times).
	@return {self}
	*/

Imba.Tag.prototype.commit = function (){
	this.render();
	return this;
};

/*

	Called by the tag-scheduler (if this tag is scheduled)
	By default it will call this.render. Do not override unless
	you really understand it.

	*/

Imba.Tag.prototype.tick = function (){
	this.render();
	return this;
};

/*
	
	A very important method that you will practically never manually.
	The tag syntax of Imba compiles to a chain of setters, which always
	ends with .end. `<a.large>` compiles to `tag('a').flag('large').end()`
	
	You are highly adviced to not override its behaviour. The first time
	end is called it will mark the tag as initialized and call Imba.Tag#setup,
	and call Imba.Tag#commit every time.
	@return {self}
	*/

Imba.Tag.prototype.end = function (){
	return this;
};

// called on <self> to check if self is called from other places
Imba.Tag.prototype.$open = function (context){
	if (context != this._context_) {
		this._tree_ = null;
		this._context_ = context;
	};
	return this;
};

/*
	This is called instead of Imba.Tag#end for `<self>` tag chains.
	Defaults to noop
	@return {self}
	*/

Imba.Tag.prototype.synced = function (){
	return this;
};

// called when the node is awakened in the dom - either automatically
// upon attachment to the dom-tree, or the first time imba needs the
// tag for a domnode that has been rendered on the server
Imba.Tag.prototype.awaken = function (){
	return this;
};

/*
	List of flags for this node. 
	*/

Imba.Tag.prototype.flags = function (){
	return this._dom.classList;
};

/*
	Add speficied flag to current node.
	If a second argument is supplied, it will be coerced into a Boolean,
	and used to indicate whether we should remove the flag instead.
	@return {self}
	*/

Imba.Tag.prototype.flag = function (name,toggler){
	// it is most natural to treat a second undefined argument as a no-switch
	// so we need to check the arguments-length
	if (arguments.length == 2) {
		if (this._dom.classList.contains(name) != !(!(toggler))) {
			this._dom.classList.toggle(name);
		};
	} else {
		// firefox will trigger a change if adding existing class
		if (!this._dom.classList.contains(name)) { this._dom.classList.add(name) };
	};
	return this;
};

/*
	Remove specified flag from node
	@return {self}
	*/

Imba.Tag.prototype.unflag = function (name){
	this._dom.classList.remove(name);
	return this;
};

/*
	Toggle specified flag on node
	@return {self}
	*/

Imba.Tag.prototype.toggleFlag = function (name){
	this._dom.classList.toggle(name);
	return this;
};

/*
	Check whether current node has specified flag
	@return {bool}
	*/

Imba.Tag.prototype.hasFlag = function (name){
	return this._dom.classList.contains(name);
};


Imba.Tag.prototype.flagIf = function (flag,bool){
	var f = this._flags_ || (this._flags_ = {});
	let prev = f[flag];
	
	if (bool && !(prev)) {
		this._dom.classList.add(flag);
		f[flag] = true;
	} else if (prev && !(bool)) {
		this._dom.classList.remove(flag);
		f[flag] = false;
	};
	
	return this;
};

/*
	Set/update a named flag. It remembers the previous
	value of the flag, and removes it before setting the new value.

		node.setFlag('type','todo')
		node.setFlag('type','project')
		# todo is removed, project is added.

	@return {self}
	*/

Imba.Tag.prototype.setFlag = function (name,value){
	let flags = this._namedFlags_ || (this._namedFlags_ = {});
	let prev = flags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		flags[name] = value;
	};
	return this;
};


/*
	Get the scheduler for this node. A new scheduler will be created
	if it does not already exist.

	@return {Imba.Scheduler}
	*/

Imba.Tag.prototype.scheduler = function (){
	return (this._scheduler == null) ? (this._scheduler = new Imba.Scheduler(this)) : this._scheduler;
};

/*

	Shorthand to start scheduling a node. The method will basically
	proxy the arguments through to scheduler.configure, and then
	activate the scheduler.
	
	@return {self}
	*/

Imba.Tag.prototype.schedule = function (options){
	if(options === undefined) options = {events: true};
	this.scheduler().configure(options).activate();
	return this;
};

/*
	Shorthand for deactivating scheduler (if tag has one).
	@deprecated
	*/

Imba.Tag.prototype.unschedule = function (){
	if (this._scheduler) { this.scheduler().deactivate() };
	return this;
};


/*
	Get the parent of current node
	@return {Imba.Tag} 
	*/

Imba.Tag.prototype.parent = function (){
	return Imba.getTagForDom(this.dom().parentNode);
};

/*
	Get the children of node
	@return {Imba.Tag[]}
	*/

Imba.Tag.prototype.children = function (sel){
	let res = [];
	for (let i = 0, items = iter$(this._dom.children), len = items.length, item; i < len; i++) {
		item = items[i];
		res.push(item._tag || Imba.getTagForDom(item));
	};
	return res;
};

Imba.Tag.prototype.querySelector = function (q){
	return Imba.getTagForDom(this._dom.querySelector(q));
};

Imba.Tag.prototype.querySelectorAll = function (q){
	var items = [];
	for (let i = 0, ary = iter$(this._dom.querySelectorAll(q)), len = ary.length; i < len; i++) {
		items.push(Imba.getTagForDom(ary[i]));
	};
	return items;
};

/*
	Check if this node matches a selector
	@return {Boolean}
	*/

Imba.Tag.prototype.matches = function (sel){
	var fn;
	if (sel instanceof Function) {
		return sel(this);
	};
	
	if (sel.query instanceof Function) { sel = sel.query() };
	if (fn = (this._dom.matches || this._dom.matchesSelector || this._dom.webkitMatchesSelector || this._dom.msMatchesSelector || this._dom.mozMatchesSelector)) {
		return fn.call(this._dom,sel);
	};
};

/*
	Get the first element matching supplied selector / filter
	traversing upwards, but including the node itself.
	@return {Imba.Tag}
	*/

Imba.Tag.prototype.closest = function (sel){
	return Imba.getTagForDom(this._dom.closest(sel));
};

/*
	Check if node contains other node
	@return {Boolean} 
	*/

Imba.Tag.prototype.contains = function (node){
	return this.dom().contains(node._dom || node);
};


/*
	Shorthand for console.log on elements
	@return {self}
	*/

Imba.Tag.prototype.log = function (){
	var $0 = arguments, i = $0.length;
	var args = new Array(i>0 ? i : 0);
	while(i>0) args[i-1] = $0[--i];
	args.unshift(console);
	Function.prototype.call.apply(console.log,args);
	return this;
};

Imba.Tag.prototype.css = function (key,val){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.css(k,v);
		};
		return this;
	};
	
	var name = Imba.CSSKeyMap[key] || key;
	
	if (val == null) {
		this.dom().style.removeProperty(name);
	} else if (val == undefined && arguments.length == 1) {
		return this.dom().style[name];
	} else {
		if ((typeof val=='number'||val instanceof Number) && name.match(/width|height|left|right|top|bottom/)) {
			this.dom().style[name] = val + "px";
		} else {
			this.dom().style[name] = val;
		};
	};
	return this;
};

Imba.Tag.prototype.setStyle = function (style){
	return this.setAttribute('style',style);
};

Imba.Tag.prototype.style = function (){
	return this.getAttribute('style');
};

/*
	Trigger an event from current node. Dispatched through the Imba event manager.
	To dispatch actual dom events, use dom.dispatchEvent instead.

	@return {Imba.Event}
	*/

Imba.Tag.prototype.trigger = function (name,data){
	if(data === undefined) data = {};
	return true && Imba.Events.trigger(name,this,{data: data});
};

/*
	Focus on current node
	@return {self}
	*/

Imba.Tag.prototype.focus = function (){
	this.dom().focus();
	return this;
};

/*
	Remove focus from current node
	@return {self}
	*/

Imba.Tag.prototype.blur = function (){
	this.dom().blur();
	return this;
};

Imba.Tag.prototype.toString = function (){
	return this.dom().outerHTML;
};


Imba.Tag.prototype.initialize = Imba.Tag;

Imba.SVGTag = function SVGTag(){ return Imba.Tag.apply(this,arguments) };

Imba.subclass(Imba.SVGTag,Imba.Tag);
Imba.SVGTag.namespaceURI = function (){
	return "http://www.w3.org/2000/svg";
};

Imba.SVGTag.buildNode = function (){
	var dom = Imba.document().createElementNS(this.namespaceURI(),this._nodeType);
	var cls = this._classes.join(" ");
	if (cls) { dom.className.baseVal = cls };
	return dom;
};

Imba.SVGTag.inherit = function (child){
	child._protoDom = null;
	if (Imba.indexOf(child._name,Imba.SVG_TAGS) >= 0) {
		child._nodeType = child._name;
		return child._classes = [];
	} else {
		child._nodeType = this._nodeType;
		var className = "_" + child._name.replace(/_/g,'-');
		return child._classes = this._classes.concat(className);
	};
};

Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");
Imba.SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

Imba.HTML_ATTRS = {
	a: "href target hreflang media download rel type",
	form: "method action enctype autocomplete target",
	button: "autofocus type",
	input: "accept disabled form list max maxlength min pattern required size step type",
	label: "accesskey for form",
	img: "src srcset",
	link: "rel type href media",
	iframe: "referrerpolicy src srcdoc sandbox",
	meta: "property content charset desc",
	optgroup: "label",
	option: "label",
	output: "for form",
	object: "type data width height",
	param: "name value",
	progress: "max",
	script: "src type async defer crossorigin integrity nonce language",
	select: "size form multiple",
	textarea: "rows cols"
};


Imba.HTML_PROPS = {
	input: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	textarea: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	form: "novalidate",
	fieldset: "disabled",
	button: "disabled",
	select: "autofocus disabled required",
	option: "disabled selected value",
	optgroup: "disabled",
	progress: "value",
	fieldset: "disabled",
	canvas: "width height"
};

function extender(obj,sup){
	for (let v, i = 0, keys = Object.keys(sup), l = keys.length, k; i < l; i++){
		k = keys[i];v = sup[k];(obj[k] == null) ? (obj[k] = v) : obj[k];
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.constructor = obj;
	if (sup.inherit) { sup.inherit(obj) };
	return obj;
};

function Tag(){
	return function(dom,ctx) {
		this.initialize(dom,ctx);
		return this;
	};
};

function TagSpawner(type){
	return function(zone) { return type.build(zone); };
};


Imba.Tags = function Tags(){
	this;
};

Imba.Tags.prototype.__clone = function (ns){
	var clone = Object.create(this);
	clone._parent = this;
	return clone;
};

Imba.Tags.prototype.ns = function (name){
	return this['_' + name.toUpperCase()] || this.defineNamespace(name);
};

Imba.Tags.prototype.defineNamespace = function (name){
	var clone = Object.create(this);
	clone._parent = this;
	clone._ns = name;
	this['_' + name.toUpperCase()] = clone;
	return clone;
};

Imba.Tags.prototype.baseType = function (name,ns){
	return (Imba.indexOf(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (fullName,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body._nodeType) {
		supr = body;
		body = null;
	};
	
	if (this[fullName]) {
		console.log("tag already exists?",fullName);
	};
	
	// if it is namespaced
	var ns;
	var name = fullName;
	let nsidx = name.indexOf(':');
	if (nsidx >= 0) {
		ns = fullName.substr(0,nsidx);
		name = fullName.substr(nsidx + 1);
		if (ns == 'svg' && !(supr)) {
			supr = 'svg:element';
		};
	};
	
	supr || (supr = this.baseType(fullName));
	
	let supertype = ((typeof supr=='string'||supr instanceof String)) ? this.findTagType(supr) : supr;
	let tagtype = Tag();
	
	tagtype._name = name;
	tagtype._flagName = null;
	
	if (name[0] == '#') {
		Imba.SINGLETONS[name.slice(1)] = tagtype;
		this[name] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		tagtype._flagName = name;
	} else {
		tagtype._flagName = "_" + fullName.replace(/[_\:]/g,'-');
		this[fullName] = tagtype;
	};
	
	extender(tagtype,supertype);
	
	if (body) {
		body.call(tagtype,tagtype,tagtype.TAGS || this);
		if (tagtype.defined) { tagtype.defined() };
		this.optimizeTag(tagtype);
	};
	return tagtype;
};

Imba.Tags.prototype.defineSingleton = function (name,supr,body){
	return this.defineTag(name,supr,body);
};

Imba.Tags.prototype.extendTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	var klass = (((typeof name=='string'||name instanceof String)) ? this.findTagType(name) : name);
	// allow for private tags here as well?
	if (body) { body && body.call(klass,klass,klass.prototype) };
	if (klass.extended) { klass.extended() };
	this.optimizeTag(klass);
	return klass;
};

Imba.Tags.prototype.optimizeTag = function (tagtype){
	var prototype_;
	return (prototype_ = tagtype.prototype) && prototype_.optimizeTagStructure  &&  prototype_.optimizeTagStructure();
};

Imba.Tags.prototype.findTagType = function (type){
	var attrs, props;
	let klass = this[type];
	if (!(klass)) {
		if (type.substr(0,4) == 'svg:') {
			klass = this.defineTag(type,'svg:element');
		} else if (Imba.HTML_TAGS.indexOf(type) >= 0) {
			klass = this.defineTag(type,'element');
			
			if (attrs = Imba.HTML_ATTRS[type]) {
				for (let i = 0, items = iter$(attrs.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i]);
				};
			};
			
			if (props = Imba.HTML_PROPS[type]) {
				for (let i = 0, items = iter$(props.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i],{dom: true});
				};
			};
		};
	};
	return klass;
};

Imba.Tags.prototype.createElement = function (name,owner){
	var typ;
	if (name instanceof Function) {
		typ = name;
	} else {
		if (true) {
			if (!this.findTagType(name)) { throw (("cannot find tag-type " + name)) };
		};
		typ = this.findTagType(name);
	};
	return typ.build(owner);
};


Imba.createElement = function (name,ctx,ref,pref){
	var type = name;
	var parent;
	if (name instanceof Function) {
		type = name;
	} else {
		if (true) {
			if (!Imba.TAGS.findTagType(name)) { throw (("cannot find tag-type " + name)) };
		};
		type = Imba.TAGS.findTagType(name);
	};
	
	if (ctx instanceof TagMap) {
		parent = ctx.par$;
	} else if (pref instanceof Imba.Tag) {
		parent = pref;
	} else {
		parent = (ctx && pref != undefined) ? ctx[pref] : ((ctx && ctx._tag || ctx));
	};
	
	var node = type.build(parent);
	
	if (ctx instanceof TagMap) {
		ctx.i$++;
		node.$key = ref;
	};
	
	// node:$ref = ref if ref
	// context:i$++ # only if it is not an array?
	if (ctx && ref != undefined) {
		ctx[ref] = node;
	};
	
	return node;
};

Imba.createTagCache = function (owner){
	var item = [];
	item._tag = owner;
	return item;
	
	var par = ((this.pref() != undefined) ? this.ctx()[this.pref()] : this.ctx()._tag);
	var node = new TagMap(this.ctx(),this.ref(),par);
	this.ctx()[this.ref()] = node;
	return node;
};

Imba.createTagMap = function (ctx,ref,pref){
	var par = ((pref != undefined) ? pref : ctx._tag);
	var node = new TagMap(ctx,ref,par);
	ctx[ref] = node;
	return node;
};

Imba.createTagList = function (ctx,ref,pref){
	var node = [];
	node._type = 4;
	node._tag = ((pref != undefined) ? pref : ctx._tag);
	ctx[ref] = node;
	return node;
};

Imba.createTagLoopResult = function (ctx,ref,pref){
	var node = [];
	node._type = 5;
	node.cache = {i$: 0};
	return node;
};

// use array instead?
function TagCache(owner){
	this._tag = owner;
	this;
};
TagCache.build = function (owner){
	var item = [];
	item._tag = owner;
	return item;
};



function TagMap(cache,ref,par){
	this.cache$ = cache;
	this.key$ = ref;
	this.par$ = par;
	this.i$ = 0;
	// self:curr$ = self:$iternew()
	// self:next$ = self:$iternew()
};

TagMap.prototype.$iter = function (){
	var item = [];
	item._type = 5;
	item.static = 5; // wrong(!)
	item.cache = this;
	return item;
};

TagMap.prototype.$prune = function (items){
	let cache = this.cache$;
	let key = this.key$;
	let clone = new TagMap(cache,key,this.par$);
	for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
		item = ary[i];
		clone[item.key$] = item;
	};
	clone.i$ = items.length;
	return cache[key] = clone;
};

Imba.TagMap = TagMap;
Imba.TagCache = TagCache;
Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;
Imba.TAGS['svg:element'] = Imba.SVGTag;

Imba.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag(name,supr,body);
};

Imba.defineSingletonTag = function (id,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = 'div';
	if(supr==undefined) supr = 'div';
	return Imba.TAGS.defineTag(this.name(),supr,body);
};

Imba.extendTag = function (name,body){
	return Imba.TAGS.extendTag(name,body);
};

Imba.getTagSingleton = function (id){
	var klass;
	var dom,node;
	
	if (klass = Imba.SINGLETONS[id]) {
		if (klass && klass.Instance) { return klass.Instance };
		
		// no instance - check for element
		if (dom = Imba.document().getElementById(id)) {
			// we have a live instance - when finding it through a selector we should awake it, no?
			// console.log('creating the singleton from existing node in dom?',id,type)
			node = klass.Instance = new klass(dom);
			node.awaken(dom); // should only awaken
			return node;
		};
		
		dom = klass.createNode();
		dom.id = id;
		node = klass.Instance = new klass(dom);
		node.end().awaken(dom);
		return node;
	} else if (dom = Imba.document().getElementById(id)) {
		return Imba.getTagForDom(dom);
	};
};

var svgSupport = typeof SVGElement !== 'undefined';

// shuold be phased out
Imba.getTagForDom = function (dom){
	if (!(dom)) { return null };
	if (dom._dom) { return dom }; // could use inheritance instead
	if (dom._tag) { return dom._tag };
	if (!dom.nodeName) { return null };
	
	var name = dom.nodeName.toLowerCase();
	var type = name;
	var ns = Imba.TAGS; //  svgSupport and dom isa SVGElement ? Imba.TAGS:_SVG : Imba.TAGS
	
	if (dom.id && Imba.SINGLETONS[dom.id]) {
		return Imba.getTagSingleton(dom.id);
	};
	
	if (svgSupport && (dom instanceof SVGElement)) {
		type = ns.findTagType("svg:" + name);
	} else if (Imba.HTML_TAGS.indexOf(name) >= 0) {
		type = ns.findTagType(name);
	} else {
		type = Imba.Tag;
	};
	// if ns.@nodeNames.indexOf(name) >= 0
	//	type = ns.findTagType(name)
	
	return new type(dom,null).awaken(dom);
};

// deprecate
Imba.generateCSSPrefixes = function (){
	var styles = window.getComputedStyle(document.documentElement,'');
	
	for (let i = 0, items = iter$(styles), len = items.length, prefixed; i < len; i++) {
		prefixed = items[i];
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
		var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
		
		// if there exists an unprefixed version -- always use this
		if (prefixed != unprefixed) {
			if (styles.hasOwnProperty(unprefixed)) { continue; };
		};
		
		// register the prefixes
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
	};
	return;
};

if (true) {
	if (document) { Imba.generateCSSPrefixes() };
	
	// Ovverride classList
	if (document && !document.documentElement.classList) {
		Imba.extendTag('element', function(tag){
			
			tag.prototype.hasFlag = function (ref){
				return new RegExp('(^|\\s)' + ref + '(\\s|$)').test(this._dom.className);
			};
			
			tag.prototype.addFlag = function (ref){
				if (this.hasFlag(ref)) { return this };
				this._dom.className += (this._dom.className ? ' ' : '') + ref;
				return this;
			};
			
			tag.prototype.unflag = function (ref){
				if (!this.hasFlag(ref)) { return this };
				var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
				this._dom.className = this._dom.className.replace(regex,'');
				return this;
			};
			
			tag.prototype.toggleFlag = function (ref){
				return this.hasFlag(ref) ? this.unflag(ref) : this.flag(ref);
			};
			
			tag.prototype.flag = function (ref,bool){
				if (arguments.length == 2 && !(!(bool)) === false) {
					return this.unflag(ref);
				};
				return this.addFlag(ref);
			};
		});
	};
};

Imba.Tag;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

// predefine all supported html tags
Imba.defineTag('fragment', 'element', function(tag){
	
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.extendTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});


Imba.extendTag('canvas', function(tag){
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom().getContext(type);
	};
});

function DataProxy(node,path,args){
	this._node = node;
	this._path = path;
	this._args = args;
	if (this._args) { this._setter = Imba.toSetter(this._path) };
};

DataProxy.bind = function (receiver,data,path,args){
	let proxy = receiver._data || (receiver._data = new this(receiver,path,args));
	proxy.bind(data,path,args);
	return receiver;
};

DataProxy.prototype.bind = function (data,key,args){
	if (data != this._data) {
		this._data = data;
	};
	return this;
};

DataProxy.prototype.getFormValue = function (){
	return this._setter ? this._data[this._path]() : this._data[this._path];
};

DataProxy.prototype.setFormValue = function (value){
	return this._setter ? this._data[this._setter](value) : ((this._data[this._path] = value));
};


var isArray = function(val) {
	return val && val.splice && val.sort;
};

var isSimilarArray = function(a,b) {
	let l = a.length,i = 0;
	if (l != b.length) { return false };
	while (i++ < l){
		if (a[i] != b[i]) { return false };
	};
	return true;
};

Imba.extendTag('input', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	
	tag.prototype.setModel = function (){
		console.warn("setModel removed. Use <input[data:path]>");
		return this;
	};
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value){
		this.dom().value = this._value = value;
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this._data && !(this.lazy())) ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.data())) { return e.silence() };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let checked = this._dom.checked;
			let mval = this._data.getFormValue(this);
			let dval = (this._value != undefined) ? this._value : this.value();
			
			if (this.type() == 'radio') {
				return this._data.setFormValue(dval,this);
			} else if (this.dom().value == 'on') {
				return this._data.setFormValue(!(!(checked)),this);
			} else if (isArray(mval)) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!(checked) && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this._data.setFormValue(dval,this);
			};
		} else {
			return this._data.setFormValue(this.value());
		};
	};
	
	// overriding end directly for performance
	tag.prototype.end = function (){
		if (!this._data || this._localValue !== undefined) { return this };
		let mval = this._data.getFormValue(this);
		if (mval == this._modelValue) { return this };
		if (!isArray(mval)) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let dval = this._value;
			let checked = isArray(mval) ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom().value == 'on') ? (
				!(!(mval))
			) : (
				mval == this._value
			));
			
			this._dom.checked = checked;
		} else {
			this._dom.value = mval;
			this._initialValue = this._dom.value;
		};
		return this;
	};
});

Imba.extendTag('textarea', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	
	tag.prototype.setModel = function (value,mods){
		console.warn("setModel removed. Use <textarea[data:path]>");
		return this;
	};
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (this._localValue == undefined) { this.dom().value = value };
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this._data && !(this.lazy())) ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		return this._data ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !this._data) { return };
		if (this._data) {
			let dval = this._data.getFormValue(this);
			this._dom.value = (dval != undefined) ? dval : '';
		};
		this._initialValue = this._dom.value;
		return this;
	};
});

Imba.extendTag('option', function(tag){
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this.dom().value = this._value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		return this._value || this.dom().value;
	};
});

Imba.extendTag('select', function(tag){
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setModel = function (value,mods){
		console.warn("setModel removed. Use <select[data:path]>");
		return this;
	};
	
	tag.prototype.setValue = function (value,syncing){
		let prev = this._value;
		this._value = value;
		if (!(syncing)) { this.syncValue(value) };
		return this;
	};
	
	tag.prototype.syncValue = function (value){
		let prev = this._syncValue;
		// check if value has changed
		if (this.multiple() && (value instanceof Array)) {
			if ((prev instanceof Array) && isSimilarArray(prev,value)) {
				return this;
			};
			// create a copy for syncValue
			value = value.slice();
		};
		
		this._syncValue = value;
		// support array for multiple?
		if (typeof value == 'object') {
			let mult = this.multiple() && (value instanceof Array);
			
			for (let i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
				opt = items[i];
				let oval = (opt._tag ? opt._tag.value() : opt.value);
				if (mult) {
					opt.selected = value.indexOf(oval) >= 0;
				} else if (value == oval) {
					this.dom().selectedIndex = i;
					break;
				};
			};
		} else {
			this.dom().value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		if (this.multiple()) {
			let res = [];
			for (let i = 0, items = iter$(this.dom().selectedOptions), len = items.length, option; i < len; i++) {
				option = items[i];
				res.push(option._tag ? option._tag.value() : option.value);
			};
			return res;
		} else {
			let opt = this.dom().selectedOptions[0];
			return opt ? ((opt._tag ? opt._tag.value() : opt.value)) : null;
		};
	};
	
	tag.prototype.onchange = function (e){
		return this._data ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.end = function (){
		if (this._data) {
			this.setValue(this._data.getFormValue(this),1);
		};
		
		if (this._value != this._syncValue) {
			this.syncValue(this._value);
		};
		return this;
	};
});


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

// Imba.Touch
// Began	A finger touched the screen.
// Moved	A finger moved on the screen.
// Stationary	A finger is touching the screen but hasn't moved.
// Ended	A finger was lifted from the screen. This is the final phase of a touch.
// Canceled The system cancelled tracking for the touch.

/*
Consolidates mouse and touch events. Touch objects persist across a touch,
from touchstart until end/cancel. When a touch starts, it will traverse
down from the innermost target, until it finds a node that responds to
ontouchstart. Unless the touch is explicitly redirected, the touch will
call ontouchmove and ontouchend / ontouchcancel on the responder when appropriate.

	tag draggable
		# called when a touch starts
		def ontouchstart touch
			flag 'dragging'
			self
		
		# called when touch moves - same touch object
		def ontouchmove touch
			# move the node with touch
			css top: touch.dy, left: touch.dx
		
		# called when touch ends
		def ontouchend touch
			unflag 'dragging'

@iname touch
*/

Imba.Touch = function Touch(event,pointer){
	// @native  = false
	this.setEvent(event);
	this.setData({});
	this.setActive(true);
	this._button = event && event.button || 0;
	this._suppress = false; // deprecated
	this._captured = false;
	this.setBubble(false);
	pointer = pointer;
	this.setUpdates(0);
	return this;
};

Imba.Touch.LastTimestamp = 0;
Imba.Touch.TapTimeout = 50;

// var lastNativeTouchTimeout = 50

var touches = [];
var count = 0;
var identifiers = {};

Imba.Touch.count = function (){
	return count;
};

Imba.Touch.lookup = function (item){
	return item && (item.__touch__ || identifiers[item.identifier]);
};

Imba.Touch.release = function (item,touch){
	var v_, $1;
	(((v_ = identifiers[item.identifier]),delete identifiers[item.identifier], v_));
	((($1 = item.__touch__),delete item.__touch__, $1));
	return;
};

Imba.Touch.ontouchstart = function (e){
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (this.lookup(t)) { continue; };
		var touch = identifiers[t.identifier] = new this(e); // (e)
		t.__touch__ = touch;
		touches.push(touch);
		count++;
		touch.touchstart(e,t);
	};
	return this;
};

Imba.Touch.ontouchmove = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchmove(e,t);
		};
	};
	
	return this;
};

Imba.Touch.ontouchend = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchend(e,t);
			this.release(t,touch);
			count--;
		};
	};
	
	// e.preventDefault
	// not always supported!
	// touches = touches.filter(||)
	return this;
};

Imba.Touch.ontouchcancel = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchcancel(e,t);
			this.release(t,touch);
			count--;
		};
	};
	return this;
};

Imba.Touch.onmousedown = function (e){
	return this;
};

Imba.Touch.onmousemove = function (e){
	return this;
};

Imba.Touch.onmouseup = function (e){
	return this;
};


Imba.Touch.prototype.phase = function(v){ return this._phase; }
Imba.Touch.prototype.setPhase = function(v){ this._phase = v; return this; };
Imba.Touch.prototype.active = function(v){ return this._active; }
Imba.Touch.prototype.setActive = function(v){ this._active = v; return this; };
Imba.Touch.prototype.event = function(v){ return this._event; }
Imba.Touch.prototype.setEvent = function(v){ this._event = v; return this; };
Imba.Touch.prototype.pointer = function(v){ return this._pointer; }
Imba.Touch.prototype.setPointer = function(v){ this._pointer = v; return this; };
Imba.Touch.prototype.target = function(v){ return this._target; }
Imba.Touch.prototype.setTarget = function(v){ this._target = v; return this; };
Imba.Touch.prototype.handler = function(v){ return this._handler; }
Imba.Touch.prototype.setHandler = function(v){ this._handler = v; return this; };
Imba.Touch.prototype.updates = function(v){ return this._updates; }
Imba.Touch.prototype.setUpdates = function(v){ this._updates = v; return this; };
Imba.Touch.prototype.suppress = function(v){ return this._suppress; }
Imba.Touch.prototype.setSuppress = function(v){ this._suppress = v; return this; };
Imba.Touch.prototype.data = function(v){ return this._data; }
Imba.Touch.prototype.setData = function(v){ this._data = v; return this; };
Imba.Touch.prototype.__bubble = {chainable: true,name: 'bubble'};
Imba.Touch.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
Imba.Touch.prototype.setBubble = function(v){ this._bubble = v; return this; };
Imba.Touch.prototype.timestamp = function(v){ return this._timestamp; }
Imba.Touch.prototype.setTimestamp = function(v){ this._timestamp = v; return this; };

Imba.Touch.prototype.gestures = function(v){ return this._gestures; }
Imba.Touch.prototype.setGestures = function(v){ this._gestures = v; return this; };

/*
	@internal
	@constructor
	*/

Imba.Touch.prototype.capture = function (){
	this._captured = true;
	this._event && this._event.stopPropagation();
	if (!this._selblocker) {
		this._selblocker = function(e) { return e.preventDefault(); };
		Imba.document().addEventListener('selectstart',this._selblocker,true);
	};
	return this;
};

Imba.Touch.prototype.isCaptured = function (){
	return !(!this._captured);
};

/*
	Extend the touch with a plugin / gesture. 
	All events (touchstart,move etc) for the touch
	will be triggered on the plugins in the order they
	are added.
	*/

Imba.Touch.prototype.extend = function (plugin){
	// console.log "added gesture!!!"
	this._gestures || (this._gestures = []);
	this._gestures.push(plugin);
	return this;
};

/*
	Redirect touch to specified target. ontouchstart will always be
	called on the new target.
	@return {Number}
	*/

Imba.Touch.prototype.redirect = function (target){
	this._redirect = target;
	return this;
};

/*
	Suppress the default behaviour. Will call preventDefault for
	all native events that are part of the touch.
	*/

Imba.Touch.prototype.suppress = function (){
	// collision with the suppress property
	this._active = false;
	
	return this;
};

Imba.Touch.prototype.setSuppress = function (value){
	console.warn('Imba.Touch#suppress= is deprecated');
	this._supress = value;
	this;
	return this;
};

Imba.Touch.prototype.touchstart = function (e,t){
	this._event = e;
	this._touch = t;
	this._button = 0;
	this._x = t.clientX;
	this._y = t.clientY;
	this.began();
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchmove = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchend = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	
	Imba.Touch.LastTimestamp = e.timeStamp;
	
	if (this._maxdr < 20) {
		var tap = new Imba.Event(e);
		tap.setType('tap');
		tap.process();
		if (tap._responder) { e.preventDefault() };
	};
	
	if (e && this.isCaptured()) {
		e.preventDefault();
	};
	
	return this;
};

Imba.Touch.prototype.touchcancel = function (e,t){
	return this.cancel();
};

Imba.Touch.prototype.mousedown = function (e,t){
	var self = this;
	self._event = e;
	self._button = e.button;
	self._x = t.clientX;
	self._y = t.clientY;
	self.began();
	self.update();
	self._mousemove = function(e) { return self.mousemove(e,e); };
	Imba.document().addEventListener('mousemove',self._mousemove,true);
	return self;
};

Imba.Touch.prototype.mousemove = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this._event = e;
	if (this.isCaptured()) { e.preventDefault() };
	this.update();
	this.move();
	return this;
};

Imba.Touch.prototype.mouseup = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	return this;
};

Imba.Touch.prototype.idle = function (){
	return this.update();
};

Imba.Touch.prototype.began = function (){
	this._timestamp = Date.now();
	this._maxdr = this._dr = 0;
	this._x0 = this._x;
	this._y0 = this._y;
	
	var dom = this.event().target;
	var node = null;
	
	this._sourceTarget = dom && Imba.getTagForDom(dom);
	
	while (dom){
		node = Imba.getTagForDom(dom);
		if (node && node.ontouchstart) {
			this._bubble = false;
			this.setTarget(node);
			this.target().ontouchstart(this);
			if (!this._bubble) { break; };
		};
		dom = dom.parentNode;
	};
	
	this._updates++;
	return this;
};

Imba.Touch.prototype.update = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	var dr = Math.sqrt(this.dx() * this.dx() + this.dy() * this.dy());
	if (dr > this._dr) { this._maxdr = dr };
	this._dr = dr;
	
	// catching a touch-redirect?!?
	if (this._redirect) {
		if (this._target && this._target.ontouchcancel) {
			this._target.ontouchcancel(this);
		};
		this.setTarget(this._redirect);
		this._redirect = null;
		if (this.target().ontouchstart) { this.target().ontouchstart(this) };
		if (this._redirect) { return this.update() }; // possibly redirecting again
	};
	
	
	this._updates++;
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchupdate(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchupdate  &&  target_.ontouchupdate(this);
	if (this._redirect) this.update();
	return this;
};

Imba.Touch.prototype.move = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchmove) { g.ontouchmove(this,this._event) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchmove  &&  target_.ontouchmove(this,this._event);
	return this;
};

Imba.Touch.prototype.ended = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchend(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchend  &&  target_.ontouchend(this);
	this.cleanup_();
	return this;
};

Imba.Touch.prototype.cancel = function (){
	if (!this._cancelled) {
		this._cancelled = true;
		this.cancelled();
		this.cleanup_();
	};
	return this;
};

Imba.Touch.prototype.cancelled = function (){
	var target_;
	if (!this._active) { return this };
	
	this._cancelled = true;
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchcancel) { g.ontouchcancel(this) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchcancel  &&  target_.ontouchcancel(this);
	return this;
};

Imba.Touch.prototype.cleanup_ = function (){
	if (this._mousemove) {
		Imba.document().removeEventListener('mousemove',this._mousemove,true);
		this._mousemove = null;
	};
	
	if (this._selblocker) {
		Imba.document().removeEventListener('selectstart',this._selblocker,true);
		this._selblocker = null;
	};
	
	return this;
};

/*
	The absolute distance the touch has moved from starting position 
	@return {Number}
	*/

Imba.Touch.prototype.dr = function (){
	return this._dr;
};

/*
	The distance the touch has moved horizontally
	@return {Number}
	*/

Imba.Touch.prototype.dx = function (){
	return this._x - this._x0;
};

/*
	The distance the touch has moved vertically
	@return {Number}
	*/

Imba.Touch.prototype.dy = function (){
	return this._y - this._y0;
};

/*
	Initial horizontal position of touch
	@return {Number}
	*/

Imba.Touch.prototype.x0 = function (){
	return this._x0;
};

/*
	Initial vertical position of touch
	@return {Number}
	*/

Imba.Touch.prototype.y0 = function (){
	return this._y0;
};

/*
	Horizontal position of touch
	@return {Number}
	*/

Imba.Touch.prototype.x = function (){
	return this._x;
};

/*
	Vertical position of touch
	@return {Number}
	*/

Imba.Touch.prototype.y = function (){
	return this._y;
};

/*
	Horizontal position of touch relative to target
	@return {Number}
	*/

Imba.Touch.prototype.tx = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._x - this._targetBox.left;
};

/*
	Vertical position of touch relative to target
	@return {Number}
	*/

Imba.Touch.prototype.ty = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._y - this._targetBox.top;
};

/*
	Button pressed in this touch. Native touches defaults to left-click (0)
	@return {Number}
	*/

Imba.Touch.prototype.button = function (){
	return this._button;
}; // @pointer ? @pointer.button : 0

Imba.Touch.prototype.sourceTarget = function (){
	return this._sourceTarget;
};

Imba.Touch.prototype.elapsed = function (){
	return Date.now() - this._timestamp;
};


Imba.TouchGesture = function TouchGesture(){ };

Imba.TouchGesture.prototype.__active = {'default': false,name: 'active'};
Imba.TouchGesture.prototype.active = function(v){ return this._active; }
Imba.TouchGesture.prototype.setActive = function(v){ this._active = v; return this; }
Imba.TouchGesture.prototype._active = false;

Imba.TouchGesture.prototype.ontouchstart = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchupdate = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchend = function (e){
	return this;
};



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40
};

var el = Imba.Tag.prototype;
el.stopModifier = function (e){
	return e.stop() || true;
};
el.preventModifier = function (e){
	return e.prevent() || true;
};
el.silenceModifier = function (e){
	return e.silence() || true;
};
el.bubbleModifier = function (e){
	return e.bubble(true) || true;
};
el.ctrlModifier = function (e){
	return e.event().ctrlKey == true;
};
el.altModifier = function (e){
	return e.event().altKey == true;
};
el.shiftModifier = function (e){
	return e.event().shiftKey == true;
};
el.metaModifier = function (e){
	return e.event().metaKey == true;
};
el.keyModifier = function (key,e){
	return e.keyCode() ? ((e.keyCode() == key)) : true;
};
el.delModifier = function (e){
	return e.keyCode() ? ((e.keyCode() == 8 || e.keyCode() == 46)) : true;
};
el.selfModifier = function (e){
	return e.event().target == this._dom;
};
el.leftModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 0)) : el.keyModifier(37,e);
};
el.rightModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 2)) : el.keyModifier(39,e);
};
el.middleModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 1)) : true;
};

el.getHandler = function (str,event){
	if (this[str]) { return this };
};

/*
Imba handles all events in the dom through a single manager,
listening at the root of your document. If Imba finds a tag
that listens to a certain event, the event will be wrapped 
in an `Imba.Event`, which normalizes some of the quirks and 
browser differences.

@iname event
*/

Imba.Event = function Event(e){
	this.setEvent(e);
	this._bubble = true;
};

/* reference to the native event */

Imba.Event.prototype.event = function(v){ return this._event; }
Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };

/* reference to the native event */

Imba.Event.prototype.prefix = function(v){ return this._prefix; }
Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };

Imba.Event.prototype.data = function(v){ return this._data; }
Imba.Event.prototype.setData = function(v){ this._data = v; return this; };

Imba.Event.prototype.responder = function(v){ return this._responder; }
Imba.Event.prototype.setResponder = function(v){ this._responder = v; return this; };

Imba.Event.wrap = function (e){
	return new this(e);
};

Imba.Event.prototype.setType = function (type){
	this._type = type;
	this;
	return this;
};

/*
	@return {String} The name of the event (case-insensitive)
	*/

Imba.Event.prototype.type = function (){
	return this._type || this.event().type;
};

Imba.Event.prototype.button = function (){
	return this.event().button;
};
Imba.Event.prototype.keyCode = function (){
	return this.event().keyCode;
};

Imba.Event.prototype.name = function (){
	return this._name || (this._name = this.type().toLowerCase().replace(/\:/g,''));
};

// mimc getset
Imba.Event.prototype.bubble = function (v){
	if (v != undefined) {
		this.setBubble(v);
		return this;
	};
	return this._bubble;
};

Imba.Event.prototype.setBubble = function (v){
	this._bubble = v;
	return this;
	return this;
};

/*
	Prevents further propagation of the current event.
	@return {self}
	*/

Imba.Event.prototype.stop = function (){
	this.setBubble(false);
	return this;
};

Imba.Event.prototype.stopPropagation = function (){
	return this.stop();
};
Imba.Event.prototype.halt = function (){
	return this.stop();
};

// migrate from cancel to prevent
Imba.Event.prototype.prevent = function (){
	if (this.event().preventDefault) {
		this.event().preventDefault();
	} else {
		this.event().defaultPrevented = true;
	};
	this.defaultPrevented = true;
	return this;
};

Imba.Event.prototype.preventDefault = function (){
	console.warn("Event#preventDefault is deprecated - use Event#prevent");
	return this.prevent();
};

/*
	Indicates whether or not event.cancel has been called.

	@return {Boolean}
	*/

Imba.Event.prototype.isPrevented = function (){
	return this.event() && this.event().defaultPrevented || this._cancel;
};

/*
	Cancel the event (if cancelable). In the case of native events it
	will call `preventDefault` on the wrapped event object.
	@return {self}
	*/

Imba.Event.prototype.cancel = function (){
	console.warn("Event#cancel is deprecated - use Event#prevent");
	return this.prevent();
};

Imba.Event.prototype.silence = function (){
	this._silenced = true;
	return this;
};

Imba.Event.prototype.isSilenced = function (){
	return !(!this._silenced);
};

/*
	A reference to the initial target of the event.
	*/

Imba.Event.prototype.target = function (){
	return Imba.getTagForDom(this.event()._target || this.event().target);
};

/*
	A reference to the object responding to the event.
	*/

Imba.Event.prototype.responder = function (){
	return this._responder;
};

/*
	Redirect the event to new target
	*/

Imba.Event.prototype.redirect = function (node){
	this._redirect = node;
	return this;
};

Imba.Event.prototype.processHandlers = function (node,handlers){
	let i = 1;
	let l = handlers.length;
	let bubble = this._bubble;
	let state = handlers.state || (handlers.state = {});
	let result;
	
	if (bubble) {
		this._bubble = 1;
	};
	
	while (i < l){
		let isMod = false;
		let handler = handlers[i++];
		let params = null;
		let context = node;
		
		if (handler instanceof Array) {
			params = handler.slice(1);
			handler = handler[0];
		};
		
		if (typeof handler == 'string') {
			if (keyCodes[handler]) {
				params = [keyCodes[handler]];
				handler = 'key';
			};
			
			let mod = handler + 'Modifier';
			
			if (node[mod]) {
				isMod = true;
				params = (params || []).concat([this,state]);
				handler = node[mod];
			};
		};
		
		// if it is still a string - call getHandler on
		// ancestor of node to see if we get a handler for this name
		if (typeof handler == 'string') {
			let el = node;
			let fn = null;
			let ctx = state.context;
			
			if (ctx) {
				if (ctx.getHandler instanceof Function) {
					ctx = ctx.getHandler(handler,this);
				};
				
				if (ctx[handler] instanceof Function) {
					handler = fn = ctx[handler];
					context = ctx;
				};
			};
			
			if (!(fn)) {
				console.warn(("event " + this.type() + ": could not find '" + handler + "' in context"),ctx);
			};
			
			// while el and (!fn or !(fn isa Function))
			// 	if fn = el.getHandler(handler)
			// 		if fn[handler] isa Function
			// 			handler = fn[handler]
			// 			context = fn
			// 		elif fn isa Function
			// 			handler = fn
			// 			context = el
			// 	else
			// 		el = el.parent
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			let res = handler.apply(context,params || [this]);
			
			if (!(isMod)) {
				this._responder || (this._responder = node);
			};
			
			if (res == false) {
				// console.log "returned false - breaking"
				break;
			};
			
			if (res && !this._silenced && (res.then instanceof Function)) {
				res.then(Imba.commit);
			};
		};
	};
	
	// if we havent stopped or dealt with bubble while handling
	if (this._bubble === 1) {
		this._bubble = bubble;
	};
	
	return null;
};

Imba.Event.prototype.process = function (){
	var name = this.name();
	var meth = ("on" + (this._prefix || '') + name);
	var args = null;
	var domtarget = this.event()._target || this.event().target;
	var domnode = domtarget._responder || domtarget;
	// @todo need to stop infinite redirect-rules here
	var result;
	var handlers;
	
	while (domnode){
		this._redirect = null;
		let node = domnode._dom ? domnode : domnode._tag;
		
		if (node) {
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!(handler)) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble()) {
						this.processHandlers(node,handler);
					};
				};
				if (!(this.bubble())) { break; };
			};
			
			if (this.bubble() && (node[meth] instanceof Function)) {
				this._responder || (this._responder = node);
				this._silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
			};
			
			if (node.onevent) {
				node.onevent(this);
			};
		};
		
		// add node.nextEventResponder as a separate method here?
		if (!(this.bubble() && (domnode = (this._redirect || (node ? node.parent() : domnode.parentNode))))) {
			break;
		};
	};
	
	this.processed();
	
	// if a handler returns a promise, notify schedulers
	// about this after promise has finished processing
	if (result && (result.then instanceof Function)) {
		result.then(this.processed.bind(this));
	};
	return this;
};


Imba.Event.prototype.processed = function (){
	if (!this._silenced && this._responder) {
		Imba.emit(Imba,'event',[this]);
		Imba.commit(this.event());
	};
	return this;
};

/*
	Return the x/left coordinate of the mouse / pointer for this event
	@return {Number} x coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.x = function (){
	return this.event().x;
};

/*
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.y = function (){
	return this.event().y;
};

/*
	Returns a Number representing a system and implementation
	dependent numeric code identifying the unmodified value of the
	pressed key; this is usually the same as keyCode.

	For mouse-events, the returned value indicates which button was
	pressed on the mouse to trigger the event.

	@return {Number}
	*/

Imba.Event.prototype.which = function (){
	return this.event().which;
};



/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
__webpack_require__(3);

/*

Manager for listening to and delegating events in Imba. A single instance
is always created by Imba (as `Imba.Events`), which handles and delegates all
events at the very root of the document. Imba does not capture all events
by default, so if you want to make sure exotic or custom DOMEvents are delegated
in Imba you will need to register them in `Imba.Events.register(myCustomEventName)`

@iname manager

*/

Imba.EventManager = function EventManager(node,pars){
	var self = this;
	if(!pars||pars.constructor !== Object) pars = {};
	var events = pars.events !== undefined ? pars.events : [];
	self._shimFocusEvents = true && window.netscape && node.onfocusin === undefined;
	self.setRoot(node);
	self.setListeners([]);
	self.setDelegators({});
	self.setDelegator(function(e) {
		self.delegate(e);
		return true;
	});
	
	for (let i = 0, items = iter$(events), len = items.length; i < len; i++) {
		self.register(items[i]);
	};
	
	return self;
};

Imba.EventManager.prototype.root = function(v){ return this._root; }
Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; };
Imba.EventManager.prototype.count = function(v){ return this._count; }
Imba.EventManager.prototype.setCount = function(v){ this._count = v; return this; };
Imba.EventManager.prototype.__enabled = {'default': false,watch: 'enabledDidSet',name: 'enabled'};
Imba.EventManager.prototype.enabled = function(v){ return this._enabled; }
Imba.EventManager.prototype.setEnabled = function(v){
	var a = this.enabled();
	if(v != a) { this._enabled = v; }
	if(v != a) { this.enabledDidSet && this.enabledDidSet(v,a,this.__enabled) }
	return this;
}
Imba.EventManager.prototype._enabled = false;
Imba.EventManager.prototype.listeners = function(v){ return this._listeners; }
Imba.EventManager.prototype.setListeners = function(v){ this._listeners = v; return this; };
Imba.EventManager.prototype.delegators = function(v){ return this._delegators; }
Imba.EventManager.prototype.setDelegators = function(v){ this._delegators = v; return this; };
Imba.EventManager.prototype.delegator = function(v){ return this._delegator; }
Imba.EventManager.prototype.setDelegator = function(v){ this._delegator = v; return this; };

Imba.EventManager.prototype.enabledDidSet = function (bool){
	bool ? this.onenable() : this.ondisable();
	return this;
};

Imba.EventManager.activate = function (){
	var Imba_;
	if (Imba.Events) { return Imba.Events };
	
	if (true) {
		Imba.POINTER || (Imba.POINTER = new Imba.Pointer());
		
		Imba.Events = new Imba.EventManager(Imba.document(),{events: [
			'keydown','keyup','keypress',
			'textInput','input','change','submit',
			'focusin','focusout','focus','blur',
			'contextmenu','dblclick',
			'mousewheel','wheel','scroll',
			'beforecopy','copy',
			'beforepaste','paste',
			'beforecut','cut'
		]});
		
		// should listen to dragdrop events by default
		Imba.Events.register([
			'dragstart','drag','dragend',
			'dragenter','dragover','dragleave','dragexit','drop'
		]);
		
		var hasTouchEvents = window && window.ontouchstart !== undefined;
		
		if (hasTouchEvents) {
			Imba.Events.listen('touchstart',function(e) {
				return Imba.Touch.ontouchstart(e);
			});
			
			Imba.Events.listen('touchmove',function(e) {
				return Imba.Touch.ontouchmove(e);
			});
			
			Imba.Events.listen('touchend',function(e) {
				return Imba.Touch.ontouchend(e);
			});
			
			Imba.Events.listen('touchcancel',function(e) {
				return Imba.Touch.ontouchcancel(e);
			});
		};
		
		Imba.Events.register('click',function(e) {
			// Only for main mousebutton, no?
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				e._imbaSimulatedTap = true;
				var tap = new Imba.Event(e);
				tap.setType('tap');
				tap.process();
				if (tap._responder) {
					return e.preventDefault();
				};
			};
			// delegate the real click event
			return Imba.Events.delegate(e);
		});
		
		Imba.Events.listen('mousedown',function(e) {
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		Imba.Events.listen('mouseup',function(e) {
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		Imba.Events.register(['mousedown','mouseup']);
		Imba.Events.setEnabled(true);
		return Imba.Events;
	};
};


/*

	Tell the current EventManager to intercept and handle event of a certain name.
	By default, Imba.Events will register interceptors for: *keydown*, *keyup*, 
	*keypress*, *textInput*, *input*, *change*, *submit*, *focusin*, *focusout*, 
	*blur*, *contextmenu*, *dblclick*, *mousewheel*, *wheel*

	*/

Imba.EventManager.prototype.register = function (name,handler){
	if(handler === undefined) handler = true;
	if (name instanceof Array) {
		for (let i = 0, items = iter$(name), len = items.length; i < len; i++) {
			this.register(items[i],handler);
		};
		return this;
	};
	
	if (this.delegators()[name]) { return this };
	// console.log("register for event {name}")
	var fn = this.delegators()[name] = (handler instanceof Function) ? handler : this.delegator();
	if (this.enabled()) { return this.root().addEventListener(name,fn,true) };
};

Imba.EventManager.prototype.listen = function (name,handler,capture){
	if(capture === undefined) capture = true;
	this.listeners().push([name,handler,capture]);
	if (this.enabled()) { this.root().addEventListener(name,handler,capture) };
	return this;
};

Imba.EventManager.prototype.delegate = function (e){
	var event = Imba.Event.wrap(e);
	event.process();
	if (this._shimFocusEvents) {
		if (e.type == 'focus') {
			Imba.Event.wrap(e).setType('focusin').process();
		} else if (e.type == 'blur') {
			Imba.Event.wrap(e).setType('focusout').process();
		};
	};
	return this;
};

/*

	Create a new Imba.Event

	*/

Imba.EventManager.prototype.create = function (type,target,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var data = pars.data !== undefined ? pars.data : null;
	var source = pars.source !== undefined ? pars.source : null;
	var event = Imba.Event.wrap({type: type,target: target});
	if (data) { (event.setData(data),data) };
	if (source) { (event.setSource(source),source) };
	return event;
};

/*

	Trigger / process an Imba.Event.

	*/

Imba.EventManager.prototype.trigger = function (){
	return this.create.apply(this,arguments).process();
};

Imba.EventManager.prototype.onenable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().addEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().addEventListener(item[0],item[1],item[2]);
	};
	
	window.addEventListener('hashchange',Imba.commit);
	return this;
};

Imba.EventManager.prototype.ondisable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().removeEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().removeEventListener(item[0],item[1],item[2]);
	};
	
	window.removeEventListener('hashchange',Imba.commit);
	return this;
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
// externs;

var Imba = __webpack_require__(1);

function removeNested(root,node,caret){
	// if node/nodes isa String
	// 	we need to use the caret to remove elements
	// 	for now we will simply not support this
	if (node instanceof Array) {
		for (let i = 0, items = iter$(node), len = items.length; i < len; i++) {
			removeNested(root,items[i],caret);
		};
	} else if (node && node._dom) {
		root.removeChild(node);
	} else if (node != null) {
		// what if this is not null?!?!?
		// take a chance and remove a text-elementng
		let next = caret ? caret.nextSibling : root._dom.firstChild;
		if ((next instanceof Text) && next.textContent == node) {
			root.removeChild(next);
		} else {
			throw 'cannot remove string';
		};
	};
	
	return caret;
};

function appendNested(root,node){
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			appendNested(root,node[i++]);
		};
	} else if (node && node._dom) {
		root.appendChild(node);
	} else if (node != null && node !== false) {
		root.appendChild(Imba.createTextNode(node));
	};
	
	return;
};


// insert nodes before a certain node
// does not need to return any tail, as before
// will still be correct there
// before must be an actual domnode
function insertNestedBefore(root,node,before){
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			insertNestedBefore(root,node[i++],before);
		};
	} else if (node && node._dom) {
		root.insertBefore(node,before);
	} else if (node != null && node !== false) {
		root.insertBefore(Imba.createTextNode(node),before);
	};
	
	return before;
};

// after must be an actual domnode
function insertNestedAfter(root,node,after){
	var before = after ? after.nextSibling : root._dom.firstChild;
	
	if (before) {
		insertNestedBefore(root,node,before);
		return before.previousSibling;
	} else {
		appendNested(root,node);
		return root._dom.lastChild;
	};
};

function reconcileCollectionChanges(root,new$,old,caret){
	
	var newLen = new$.length;
	var lastNew = new$[newLen - 1];
	
	// This re-order algorithm is based on the following principle:
	// 
	// We build a "chain" which shows which items are already sorted.
	// If we're going from [1, 2, 3] -> [2, 1, 3], the tree looks like:
	//
	// 	3 ->  0 (idx)
	// 	2 -> -1 (idx)
	// 	1 -> -1 (idx)
	//
	// This tells us that we have two chains of ordered items:
	// 
	// 	(1, 3) and (2)
	// 
	// The optimal re-ordering then becomes to keep the longest chain intact,
	// and move all the other items.
	
	var newPosition = [];
	
	// The tree/graph itself
	var prevChain = [];
	// The length of the chain
	var lengthChain = [];
	
	// Keep track of the longest chain
	var maxChainLength = 0;
	var maxChainEnd = 0;
	
	var hasTextNodes = false;
	var newPos;
	
	for (let idx = 0, items = iter$(old), len = items.length, node; idx < len; idx++) {
		// special case for Text nodes
		node = items[idx];
		if (node && node.nodeType == 3) {
			newPos = new$.indexOf(node.textContent);
			if (newPos >= 0) { new$[newPos] = node };
			hasTextNodes = true;
		} else {
			newPos = new$.indexOf(node);
		};
		
		newPosition.push(newPos);
		
		if (newPos == -1) {
			root.removeChild(node);
			prevChain.push(-1);
			lengthChain.push(-1);
			continue;
		};
		
		var prevIdx = newPosition.length - 2;
		
		// Build the chain:
		while (prevIdx >= 0){
			if (newPosition[prevIdx] == -1) {
				prevIdx--;
			} else if (newPos > newPosition[prevIdx]) {
				// Yay, we're bigger than the previous!
				break;
			} else {
				// Nope, let's walk back the chain
				prevIdx = prevChain[prevIdx];
			};
		};
		
		prevChain.push(prevIdx);
		
		var currLength = (prevIdx == -1) ? 0 : (lengthChain[prevIdx] + 1);
		
		if (currLength > maxChainLength) {
			maxChainLength = currLength;
			maxChainEnd = idx;
		};
		
		lengthChain.push(currLength);
	};
	
	var stickyNodes = [];
	
	// Now we can walk the longest chain backwards and mark them as "sticky",
	// which implies that they should not be moved
	var cursor = newPosition.length - 1;
	while (cursor >= 0){
		if (cursor == maxChainEnd && newPosition[cursor] != -1) {
			stickyNodes[newPosition[cursor]] = true;
			maxChainEnd = prevChain[maxChainEnd];
		};
		
		cursor -= 1;
	};
	
	// possible to do this in reversed order instead?
	for (let idx = 0, items = iter$(new$), len = items.length, node; idx < len; idx++) {
		node = items[idx];
		if (!stickyNodes[idx]) {
			// create textnode for string, and update the array
			if (!(node && node._dom)) {
				node = new$[idx] = Imba.createTextNode(node);
			};
			
			var after = new$[idx - 1];
			insertNestedAfter(root,node,(after && after._dom || after || caret));
		};
		
		caret = node._dom || (caret && caret.nextSibling || root._dom.firstChild);
	};
	
	// should trust that the last item in new list is the caret
	return lastNew && lastNew._dom || caret;
};


// expects a flat non-sparse array of nodes in both new and old, always
function reconcileCollection(root,new$,old,caret){
	var k = new$.length;
	var i = k;
	var last = new$[k - 1];
	
	
	if (k == old.length && new$[0] === old[0]) {
		// running through to compare
		while (i--){
			if (new$[i] !== old[i]) { break; };
		};
	};
	
	if (i == -1) {
		return last && last._dom || last || caret;
	} else {
		return reconcileCollectionChanges(root,new$,old,caret);
	};
};

// TYPE 5 - we know that we are dealing with a single array of
// keyed tags - and root has no other children
function reconcileLoop(root,new$,old,caret){
	var nl = new$.length;
	var ol = old.length;
	var cl = new$.cache.i$; // cache-length
	var i = 0,d = nl - ol;
	
	// find the first index that is different
	while (i < ol && i < nl && new$[i] === old[i]){
		i++;
	};
	
	// conditionally prune cache
	if (cl > 1000 && (cl - nl) > 500) {
		new$.cache.$prune(new$);
	};
	
	if (d > 0 && i == ol) {
		// added at end
		while (i < nl){
			root.appendChild(new$[i++]);
		};
		return;
	} else if (d > 0) {
		let i1 = nl;
		while (i1 > i && new$[i1 - 1] === old[i1 - 1 - d]){
			i1--;
		};
		
		if (d == (i1 - i)) {
			// console.log "added in chunk",i,i1
			let before = old[i]._dom;
			while (i < i1){
				root.insertBefore(new$[i++],before);
			};
			return;
		};
	} else if (d < 0 && i == nl) {
		// removed at end
		while (i < ol){
			root.removeChild(old[i++]);
		};
		return;
	} else if (d < 0) {
		let i1 = ol;
		while (i1 > i && new$[i1 - 1 + d] === old[i1 - 1]){
			i1--;
		};
		
		if (d == (i - i1)) {
			while (i < i1){
				root.removeChild(old[i++]);
			};
			return;
		};
	} else if (i == nl) {
		return;
	};
	
	return reconcileCollectionChanges(root,new$,old,caret);
};

// expects a flat non-sparse array of nodes in both new and old, always
function reconcileIndexedArray(root,array,old,caret){
	var newLen = array.taglen;
	var prevLen = array.domlen || 0;
	var last = newLen ? array[newLen - 1] : null;
	// console.log "reconcile optimized array(!)",caret,newLen,prevLen,array
	
	if (prevLen > newLen) {
		while (prevLen > newLen){
			var item = array[--prevLen];
			root.removeChild(item._dom);
		};
	} else if (newLen > prevLen) {
		// find the item to insert before
		let prevLast = prevLen ? array[prevLen - 1]._dom : caret;
		let before = prevLast ? prevLast.nextSibling : root._dom.firstChild;
		
		while (prevLen < newLen){
			let node = array[prevLen++];
			before ? root.insertBefore(node._dom,before) : root.appendChild(node._dom);
		};
	};
	
	array.domlen = newLen;
	return last ? last._dom : caret;
};


// the general reconciler that respects conditions etc
// caret is the current node we want to insert things after
function reconcileNested(root,new$,old,caret){
	
	// var skipnew = new == null or new === false or new === true
	var newIsNull = new$ == null || new$ === false;
	var oldIsNull = old == null || old === false;
	
	
	if (new$ === old) {
		// remember that the caret must be an actual dom element
		// we should instead move the actual caret? - trust
		if (newIsNull) {
			return caret;
		} else if (new$._dom) {
			return new$._dom;
		} else if ((new$ instanceof Array) && new$.taglen != null) {
			return reconcileIndexedArray(root,new$,old,caret);
		} else {
			return caret ? caret.nextSibling : root._dom.firstChild;
		};
	} else if (new$ instanceof Array) {
		if (old instanceof Array) {
			// look for slot instead?
			let typ = new$.static;
			if (typ || old.static) {
				// if the static is not nested - we could get a hint from compiler
				// and just skip it
				if (typ == old.static) { // should also include a reference?
					for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
						// this is where we could do the triple equal directly
						caret = reconcileNested(root,items[i],old[i],caret);
					};
					return caret;
				} else {
					removeNested(root,old,caret);
				};
				
				// if they are not the same we continue through to the default
			} else {
				// Could use optimized loop if we know that it only consists of nodes
				return reconcileCollection(root,new$,old,caret);
			};
		} else if (!(oldIsNull)) {
			if (old._dom) {
				root.removeChild(old);
			} else {
				// old was a string-like object?
				root.removeChild(caret ? caret.nextSibling : root._dom.firstChild);
			};
		};
		
		return insertNestedAfter(root,new$,caret);
		// remove old
	} else if (!(newIsNull) && new$._dom) {
		if (!(oldIsNull)) { removeNested(root,old,caret) };
		return insertNestedAfter(root,new$,caret);
	} else if (newIsNull) {
		if (!(oldIsNull)) { removeNested(root,old,caret) };
		return caret;
	} else {
		// if old did not exist we need to add a new directly
		let nextNode;
		// if old was array or imbatag we need to remove it and then add
		if (old instanceof Array) {
			removeNested(root,old,caret);
		} else if (old && old._dom) {
			root.removeChild(old);
		} else if (!(oldIsNull)) {
			// ...
			nextNode = caret ? caret.nextSibling : root._dom.firstChild;
			if ((nextNode instanceof Text) && nextNode.textContent != new$) {
				nextNode.textContent = new$;
				return nextNode;
			};
		};
		
		// now add the textnode
		return insertNestedAfter(root,new$,caret);
	};
};


Imba.extendTag('element', function(tag){
	
	// 1 - static shape - unknown content
	// 2 - static shape and static children
	// 3 - single item
	// 4 - optimized array - only length will change
	// 5 - optimized collection
	// 6 - text only
	
	tag.prototype.setChildren = function (new$,typ){
		// if typeof new == 'string'
		// 	return self.text = new
		var old = this._tree_;
		
		if (new$ === old && new$ && new$.taglen == undefined) {
			return this;
		};
		
		if (!(old) && typ != 3) {
			this.removeAllChildren();
			appendNested(this,new$);
		} else if (typ == 1) {
			let caret = null;
			for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
				caret = reconcileNested(this,items[i],old[i],caret);
			};
		} else if (typ == 2) {
			return this;
		} else if (typ == 3) {
			let ntyp = typeof new$;
			
			if (new$ && new$._dom) {
				this.removeAllChildren();
				this.appendChild(new$);
			} else if (new$ instanceof Array) {
				if (new$._type == 5 && old && old._type == 5) {
					reconcileLoop(this,new$,old,null);
				} else if (old instanceof Array) {
					reconcileNested(this,new$,old,null);
				} else {
					this.removeAllChildren();
					appendNested(this,new$);
				};
			} else {
				this.setText(new$);
				return this;
			};
		} else if (typ == 4) {
			reconcileIndexedArray(this,new$,old,null);
		} else if (typ == 5) {
			reconcileLoop(this,new$,old,null);
		} else if ((new$ instanceof Array) && (old instanceof Array)) {
			reconcileNested(this,new$,old,null);
		} else {
			// what if text?
			this.removeAllChildren();
			appendNested(this,new$);
		};
		
		this._tree_ = new$;
		return this;
	};
	
	tag.prototype.content = function (){
		return this._content || this.children().toArray();
	};
	
	tag.prototype.setText = function (text){
		if (text != this._tree_) {
			var val = (text === null || text === false) ? '' : text;
			(this._text_ || this._dom).textContent = val;
			this._text_ || (this._text_ = this._dom.firstChild);
			this._tree_ = text;
		};
		return this;
	};
});

// alias setContent to setChildren
var proto = Imba.Tag.prototype;
proto.setContent = proto.setChildren;

// optimization for setText
var apple = typeof navigator != 'undefined' && (navigator.vendor || '').indexOf('Apple') == 0;
if (apple) {
	proto.setText = function (text){
		if (text != this._tree_) {
			this._dom.textContent = ((text === null || text === false) ? '' : text);
			this._tree_ = text;
		};
		return this;
	};
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Router = __webpack_require__(18).Router;

function Doc(src,app){
	this._src = src;
	this._path = src.replace(/\.md$/,'');
	this._app = app;
	this._ready = false;
	this.fetch();
	this;
};

exports.Doc = Doc; // export class 
Doc.prototype.path = function(v){ return this._path; }
Doc.prototype.setPath = function(v){ this._path = v; return this; };
Doc.prototype.src = function(v){ return this._src; }
Doc.prototype.setSrc = function(v){ this._src = v; return this; };
Doc.prototype.data = function(v){ return this._data; }
Doc.prototype.setData = function(v){ this._data = v; return this; };

Doc.prototype.ready = function (){
	return this._ready;
};

Doc.prototype.fetch = function (){
	var self = this;
	return self._promise || (self._promise = self._app.fetch(self.src()).then(function(res) {
		return self.load(res);
	}));
};

Doc.prototype.load = function (doc){
	this._data = doc;
	this._meta = doc.meta || {};
	this._ready = true;
	Imba.commit();
	return this;
};

Doc.prototype.title = function (){
	return this._data.title || 'path';
};

Doc.prototype.toc = function (){
	return this._data && this._data.toc[0];
};

Doc.prototype.body = function (){
	return this._data && this._data.body;
};


var Cache = exports.Cache = {};
var requests = {};

function App(cache){
	if(cache === undefined) cache = {};
	this._cache = cache;
	this._docs = {};
	if (true) {
		this._loc = document.location;
	};
	
	if (this._cache.guide) {
		this._guide = JSON.parse(JSON.stringify(this._cache.guide));
		// for item,i in @guide
		// 	@guide[item:id] = item
		// 	item:next = @guide[i + 1]
		// 	item:prev = @guide[i - 1]
	};
	this;
};

exports.App = App; // export class 
App.prototype.req = function(v){ return this._req; }
App.prototype.setReq = function(v){ this._req = v; return this; };
App.prototype.cache = function(v){ return this._cache; }
App.prototype.setCache = function(v){ this._cache = v; return this; };
App.prototype.issues = function(v){ return this._issues; }
App.prototype.setIssues = function(v){ this._issues = v; return this; };

App.deserialize = function (data){
	if(data === undefined) data = '{}';
	return new this(JSON.parse(data.replace(/§§SCRIPT§§/g,"script")));
};

App.prototype.reset = function (){
	this.setCache({});
	return this;
};

App.prototype.router = function (){
	return this._router || (this._router = new Router(this));
};

App.prototype.path = function (){
	return true && this._loc.pathname;
};

App.prototype.hash = function (){
	return true && this._loc.hash.substr(1);
};

App.prototype.doc = function (src){
	return this._docs[src] || (this._docs[src] = new Doc(src,this));
};

App.prototype.guide = function (){
	return this._guide || (this._guide = this._cache.guide); // .map do ||
};

App.prototype.serialize = function (){
	return JSON.stringify(this.cache()).replace(/\bscript/g,"§§SCRIPT§§");
};

if (false) {};

if (true) {
	App.prototype.fetch = function (src){
		var self = this;
		if (self.cache()[src]) {
			return Promise.resolve(self.cache()[src]);
		};
		
		return requests[src] || (requests[src] = new Promise(async function(resolve) {
			var req = await window.fetch(src);
			var resp = await req.json();
			return resolve(self.cache()[src] = resp);
		}));
	};
};

App.prototype.fetchDocument = function (src,cb){
	var self = this;
	var res = self.deps()[src];
	console.log("no longer?");
	
	if (false) {} else {
		// should guard against multiple loads
		if (res) {
			cb && cb(res);
			return {then: function(v) { return v(res); }}; // fake promise hack
		};
		
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load',function(res) {
			res = self.deps()[src] = JSON.parse(xhr.responseText);
			return cb && cb(res);
		});
		xhr.open("GET",src);
		xhr.send();
	};
	
	return self;
};

App.prototype.issues = function (){
	return this._issues || (this._issues = Doc.get('/issues/all','json'));
};



/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// externs;

function Router(app){
	var self = this;
	self._app = app;
	
	if (true) {
		window.onpopstate = function(e) {
			return self.refresh();
		};
	};
	
	self;
};

exports.Router = Router; // export class 
Router.prototype.path = function(v){ return this._path; }
Router.prototype.setPath = function(v){ this._path = v; return this; };

Router.slug = function (str){
	str = str.replace(/^\s+|\s+$/g,'').toLowerCase(); // trim
	
	var from = "àáäâåèéëêìíïîòóöôùúüûñç·/_,:;";
	var to = "aaaaaeeeeiiiioooouuuunc------";
	str = str.replace(/[^a-z0-9 -]/g,''); // remove invalid chars
	str = str.replace(/\s+/g,'-'); // collapse whitespace and replace by -
	str = str.replace(/-+/g,'-'); // collapse dashes
	
	return str;
};

Router.prototype.refresh = function (){
	if (true) {
		document.body.setAttribute('data-route',this.segment(0));
		Imba.commit();
	};
	return this;
};

Router.prototype.path = function (){
	return this._app.path();
};

Router.prototype.hash = function (){
	return this._app.hash();
};

Router.prototype.ext = function (){
	var path = this.path();
	var m = path.match(/\.([^\/]+)$/);
	return m && m[1] || '';
};

Router.prototype.segment = function (nr){
	if(nr === undefined) nr = 0;
	return this.path().split('/')[nr + 1] || '';
};

Router.prototype.go = function (href,state,replace){
	if(state === undefined) state = {};
	if(replace === undefined) replace = false;
	if (href == '/install') {
		// redirects here
		href = '/guides#toc-installation';
	};
	
	if (replace) {
		history.replaceState(state,null,href);
		this.refresh();
	} else {
		history.pushState(state,null,href);
		this.refresh();
		// ga('send', 'pageview', href)
	};
	
	if (!href.match(/\#/)) {
		window.scrollTo(0,0);
	};
	
	return this;
};

Router.prototype.scoped = function (reg,part){
	var path = this.path() + '#' + this.hash();
	if ((typeof reg=='string'||reg instanceof String)) {
		var nxt = path[reg.length];
		return path.substr(0,reg.length) == reg && (!(nxt) || nxt == '-' || nxt == '/' || nxt == '#' || nxt == '?' || nxt == '_');
	} else if (reg instanceof RegExp) {
		var m = path.match(reg);
		return (part && m) ? m[part] : m;
	} else {
		return false;
	};
};

Router.prototype.match = function (reg,part){
	var path = this.path() + '#' + this.hash();
	
	if ((typeof reg=='string'||reg instanceof String)) {
		return path == reg;
	} else if (reg instanceof RegExp) {
		var m = path.match(reg);
		return (part && m) ? m[part] : m;
	} else {
		return false;
	};
};

Imba.extendTag('element', function(tag){
	tag.prototype.route = function(v){ return this.getAttribute('route'); }
	tag.prototype.setRoute = function(v){ this.setAttribute('route',v); return this; };
	
	tag.prototype.router = function (){
		return this.app().router();
	};
	
	tag.prototype.reroute = function (){
		var scoped = this.router().scoped(this.route(),this);
		this.flag('scoped',scoped);
		this.flag('selected',this.router().match(this.route(),this));
		if (scoped != this._scoped) {
			this._scoped = scoped;
			scoped ? this.didscope() : this.didunscope();
		};
		return this;
	};
	
	tag.prototype.didscope = function (){
		return this;
	};
	
	tag.prototype.didunscope = function (){
		return this;
	};
});

// extend links
Imba.extendTag('a', function(tag){
	
	tag.prototype.route = function (){
		return this._route || this.href();
	};
	
	tag.prototype.ontap = function (e){
		var m;
		var href = this.href().replace(/^http\:\/\/imba\.io/,'');
		
		if (e.event().metaKey || e.event().altKey) {
			e._responder = null;
			return e.stop();
		};
		
		if (m = href.match(/gist\.github\.com\/([^\/]+)\/([A-Za-z\d]+)/)) {
			console.log('gist!!',m[1],m[2]);
			Imba.getTagSingleton('gist').open(m[2]);
			return e.prevent().stop();
		};
		
		if (href[0] == '#' || href[0] == '/') {
			e.prevent().stop();
			this.router().go(href,{});
			Imba.Events.trigger('route',this);
		} else {
			e._responder = null;
			return e.stop();
		};
		return this;
	};
	
	tag.prototype.render = function (){
		if (true) this.reroute();
		return this;
	};
});


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var HomePage = __webpack_require__(20).HomePage;
var GuidesPage = __webpack_require__(25).GuidesPage;
var DocsPage = __webpack_require__(26).DocsPage;

Imba.extendTag('element', function(tag){
	
	tag.prototype.root = function (){
		return this._owner_ ? this._owner_.root() : this;
	};
	
	tag.prototype.app = function (){
		return this.root().app();
	};
});


var Site = Imba.defineTag('Site', function(tag){
	
	tag.prototype.app = function (){
		return this.data();
	};
	
	tag.prototype.root = function (){
		return this;
	};
	
	tag.prototype.router = function (){
		return this.app().router();
	};
	
	tag.prototype.load = function (){
		console.log("loading app.router");
		return new Promise(function(resolve) {
			console.log("Site#load");
			return setTimeout(resolve,200);
		});
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		console.log("render site",this.app().path());
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('header',$,0,this).setId('header').setContent(
				$[1] || _1('nav',$,1,0).flag('content').setContent([
					_1('a',$,2,1).flag('tab').flag('logo').setHref('/home').setContent($[3] || _1('i',$,3,2).setText('imba'),2),
					_1('span',$,4,1).flag('greedy'),
					_1('a',$,5,1).flag('tab').flag('home').setHref('/home').setContent($[6] || _1('i',$,6,5).setText('home'),2),
					_1('a',$,7,1).flag('tab').flag('guides').setHref('/guide').setContent($[8] || _1('i',$,8,7).setText('learn'),2),
					_1('a',$,9,1).flag('tab').flag('docs').setHref('/docs').setContent($[10] || _1('i',$,10,9).setText('api'),2),
					_1('a',$,11,1).flag('twitter').setHref('http://twitter.com/imbajs').setContent($[12] || _1('i',$,12,11).setText('twitter'),2),
					_1('a',$,13,1).flag('github').setHref('https://github.com/somebee/imba').setContent($[14] || _1('i',$,14,13).setText('github'),2),
					_1('a',$,15,1).flag('issues').setHref('https://github.com/somebee/imba/issues').setContent($[16] || _1('i',$,16,15).setText('issues'),2),
					_1('a',$,17,1).flag('menu').on$(0,['tap','toggleMenu'],this).setContent($[18] || _1('b',$,18,17),2)
				],2)
			,2),
			
			_1('main',$,19,this),
			
			_1('footer',$,23,this).setId('footer').setContent([
				_1('hr',$,24,23),
				_1('div',$,25,23).flag('lft').setText("Imba © 2015-2018"),
				_1('div',$,26,23).flag('rgt').setContent([
					_1('a',$,27,26).setHref('http://twitter.com/imbajs').setText('Twitter'),
					_1('a',$,28,26).setHref('http://github.com/somebee/imba').setText('GitHub'),
					_1('a',$,29,26).setHref('http://github.com/somebee/imba/issues').setText('Issues'),
					_1('a',$,30,26).setHref('http://gitter.im/somebee/imba').setText('Chat')
				],2)
			],2)
		],2).synced((
			$[0].end((
				$[1].end((
					$[2].end(),
					$[5].end(),
					$[7].end(),
					$[9].end(),
					$[11].end(),
					$[13].end(),
					$[15].end(),
					$[17].end()
				,true))
			,true)),
			$[19].setContent(
				this.router().scoped('/home') ? (
					($[20] || _1(HomePage,$,20,19)).end()
				) : (this.router().scoped('/guide') ? (
					($[21] || _1(GuidesPage,$,21,19)).bindData(this.app(),'guide',[]).end()
				) : (this.router().scoped('/docs') ? (
					($[22] || _1(DocsPage,$,22,19)).end()
				) : void(0)))
			,3).end(),
			$[23].end((
				$[26].end()
			,true))
		,true));
	};
})
exports.Site = Site;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;

var Example = __webpack_require__(4).Example;
var Marked = __webpack_require__(21).Marked;
var Pattern = __webpack_require__(24).Pattern;


var HomePage = Imba.defineTag('HomePage', Page, function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$, t0;
		return this.$open(0).setChildren($[0] || _1('div',$,0,this).flag('body').setContent([
			t0 = (t0=_1('div',$,1,0)).setId('hero').flag('dark').setContent(
				this._pattern = this._pattern||_1(Pattern,t0).flag('pattern')
			// <herosnippet.hero.dark src='/home/examples/hero.imba'>
			,2),
			_1('div',$,2,0).flag('content').setContent([
				_1(Marked,$,3,2).flag('section').flag('md').flag('welcome').flag('huge').flag('light').setText("# Create complex web apps with ease!\n\nImba is a new programming language for the web that compiles to highly \nperformant and readable JavaScript. It has language level support for defining, \nextending, subclassing, instantiating and rendering dom nodes. For a simple \napplication like TodoMVC, it is more than \n[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) \nwith less code, and a much smaller library.\n\n---\n\n- ## Imba.inspiration\n  Imba brings the best from Ruby, Python, and React (+ JSX) together in a clean language and runtime.\n\n- ## Imba.interoperability\n  Imba compiles down to clean and readable JavaScript. Use any JS library in Imba and vica-versa.\n\n- ## Imba.performance\n  Build your application views using Imba's native tags for unprecedented performance.\n"),
				
				// <Example.dark heading="Simple reminders" src='/home/examples/reminders.imba'>
				
				_1(Marked,$,4,2).flag('section').flag('md').setText("## Reusable components\n\nA custom tag / component can maintain internal state and control how to render itself.\nWith the performance of DOM reconciliation in Imba, you can use one-way declarative bindings,\neven for animations. Write all your views in a straight-forward linear fashion as if you could\nrerender your whole application on **every single** data/state change."),
				
				// <Example.dark heading="World clock" src='/home/examples/clock.imba'>
				
				_1(Marked,$,5,2).flag('section').flag('md').setText("## Extend native tags\n\nIn addition to defining custom tags, you can also extend native tags, or inherit from them.\nBinding to dom events is as simple as defining methods on your tags; all events will be\nefficiently delegated and handled by Imba. Let's define a simple sketchpad...")
			
			// <Example.dark heading="Custom canvas" src='/home/examples/canvas.imba'>
			],2)
		],2),2).synced((
			$[0].end((
				$[1].end((
					this._pattern.end()
				,true)),
				$[2].end((
					$[3].end(),
					$[4].end(),
					$[5].end()
				,true))
			,true))
		,true));
	};
})
exports.HomePage = HomePage;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// define renderer
var marked = __webpack_require__(22);
var mdr = new (marked.Renderer)();

mdr.heading = function (text,lvl){
	return ("<h" + lvl + ">" + text + "</h" + lvl + ">");
};

var Marked = Imba.defineTag('Marked', function(tag){
	tag.prototype.renderer = function (){
		return this;
	};
	
	tag.prototype.setText = function (text){
		if (text != this._text) {
			this._text = text;
			this.dom().innerHTML = marked(text,{renderer: mdr});
		};
		return this;
	};
	
	tag.prototype.setContent = function (val,typ){
		this.setText(val,0);
		return this;
	};
})
exports.Marked = Marked;



/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {
'use strict';

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ <>]+(@|:\/)[^ <>]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^<'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)([\s\S]*?[^`])\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|\\[\[\]]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = escape(
          cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1])
        );
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2].trim(), true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return text;
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
      return text;
    }
  }
  if (this.options.baseUrl && !originIndependentUrl.test(href)) {
    href = resolveUrl(this.options.baseUrl, href);
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  if (this.options.baseUrl && !originIndependentUrl.test(href)) {
    href = resolveUrl(this.options.baseUrl, href);
  }
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function resolveUrl(base, href) {
  if (!baseUrls[' ' + base]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (/^[^:]+:\/*[^/]*$/.test(base)) {
      baseUrls[' ' + base] = base + '/';
    } else {
      baseUrls[' ' + base] = base.replace(/[^/]*$/, '');
    }
  }
  base = baseUrls[' ' + base];

  if (href.slice(0, 2) === '//') {
    return base.replace(/:[\s\S]*/, ':') + href;
  } else if (href.charAt(0) === '/') {
    return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
  } else {
    return base + href;
  }
}
var baseUrls = {};
var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occurred:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false,
  baseUrl: null
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (true) {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23)))

/***/ }),
/* 23 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
function shuffle(array){
	var counter = array.length,temp,index;
	
	// While there are elements in the array
	while (counter > 0){
		// Pick a random index
		index = Math.floor(Math.random() * counter);
		counter--; // Decrease counter by 1
		// And swap the last element with it
		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	};
	
	return array;
};

var Pattern = Imba.defineTag('Pattern', function(tag){
	
	tag.prototype.setup = function (){
		if (false) {};
		var parts = {tags: [],keywords: [],methods: []};
		var items = [];
		var lines = [];
		
		for (let o = Imba.Tag.prototype, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++){
			k = keys[i];v = o[k];items.push(("<em>" + k + "</em>"));
			parts.methods.push(("<em>" + k + "</em>"));
		};
		
		for (let i = 0, ary = iter$(Imba.HTML_TAGS || HTML_TAGS), len = ary.length, k; i < len; i++) {
			k = ary[i];
			items.push(("<u>&lt;" + k + "&gt;</u>"));
			parts.tags.push(("<u>&lt;" + k + "&gt;</u>"));
		};
		
		var words = "def if else elif while until for in of var let class extend export import tag global";
		
		for (let i = 0, ary = iter$(words.split(" ")), len = ary.length, k; i < len; i++) {
			k = ary[i];
			items.push(("<i>" + k + "</i>"));
			parts.keywords.push(("<i>" + k + "</i>"));
		};
		
		var shuffled = shuffle(items);
		var all = [].concat(shuffled);
		var count = items.length - 1;
		
		for (let ln = 0; ln <= 14; ln++) {
			let chars = 0;
			lines[ln] = [];
			while (chars < 300){
				let item = (shuffled.pop() || all[Math.floor(count * Math.random())]);
				if (item) {
					chars += item.length;
					lines[ln].push(item);
				} else {
					chars = 400;
				};
			};
		};
		
		this.dom().innerHTML = '<div>' + lines.map(function(ln,i) {
			let o = Math.max(0,((i - 2) * 0.3 / 14)).toFixed(2);
			return ("<div class='line' style='opacity: " + o + ";'>") + ln.join(" ") + '</div>';
		}).join('') + '</div>';
		return this;
	};
})
exports.Pattern = Pattern;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _3 = Imba.createTagList, _2 = Imba.createTagMap, _4 = Imba.createTagLoopResult, _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;
var Snippet = __webpack_require__(4).Snippet;

var GuideTOC = Imba.defineTag('GuideTOC', function(tag){
	tag.prototype.toc = function(v){ return this._toc; }
	tag.prototype.setToc = function(v){ this._toc = v; return this; };
	tag.prototype.level = function(v){ return this.getAttribute('level'); }
	tag.prototype.setLevel = function(v){ this.setAttribute('level',v); return this; };
	
	tag.prototype.toggle = function (){
		return this.toggleFlag('collapsed');
	};
	
	tag.prototype.toc = function (){
		return this._toc || this.data().toc();
	};
	
	tag.prototype.route = function (){
		return ("" + (this.data().path()) + "#" + (this.toc().slug));
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		if (!self.data().ready()) { return self };
		
		let toc = self.toc();
		self.reroute();
		
		return self.$open(0).flag('toc').flag('entry').setLevel((toc.level)).setChildren(
			(toc.children.length && toc.level < 3) ? Imba.static([
				($[0] || _1('div',$,0,self).flag('header').setContent(
					$[1] || _1('a',$,1,0)
				,2)).end((
					$[1].setHref(self.route()).setContent(toc.title,3).end()
				,true)),
				($[2] || _1('div',$,2,self).flag('content')).setContent(
					(function($0) {
						var $$ = $0.$iter();
						for (let i = 0, items = iter$(toc.children), len = items.length, child; i < len; i++) {
							child = items[i];
							if (child.level >= 3) { continue; };
							$$.push(($0[i] || _1(GuideTOC,$0,i)).bindData(self,'data',[]).setToc(child).end());
						};return $$;
					})($[3] || _2($,3,$[2]))
				,5).end()
			],2,1) : (
				($[4] || _1('a',$,4,self)).setHref(self.route()).setContent(toc.title,3).end()
			)
		,3).synced();
	};
});

var Guide = Imba.defineTag('Guide', function(tag){
	
	tag.prototype.setup = function (){
		this.render();
		this._body.dom().innerHTML = this.data().body;
		if (true) {
			this.awakenSnippets();
		};
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, ref, ref1;
		return this.$open(0).flag('md').setChildren($.$ = $.$ || [
			this._body = this._body||_1('div',this).flag('body'),
			_1('footer',$,0,this)
		],2).synced((
			$[0].setContent([
				(ref = this.app().guide()[this.data().prev]) ? (
					($[1] || _1('a',$,1,0).flag('prev')).setHref(("/guide/" + (ref.id))).setText("← " + ref.title).end()
				) : void(0),
				(ref1 = this.app().guide()[this.data().next]) ? (
					($[2] || _1('a',$,2,0).flag('next')).setHref(("/guide/" + (ref1.id))).setContent(ref1.title + " →",3).end()
				) : void(0)
			],1).end()
		,true));
	};
	
	tag.prototype.awakenSnippets = function (){
		for (let i = 0, items = iter$(this.dom().querySelectorAll('.snippet')), len = items.length, item; i < len; i++) {
			item = items[i];
			let code = item.textContent;
			if (code.indexOf('Imba.mount') >= 0) {
				Snippet.replace(item);
			};
		};
		return this;
	};
});

var TOC = Imba.defineTag('TOC', 'li', function(tag){
	tag.prototype.toc = function(v){ return this._toc; }
	tag.prototype.setToc = function(v){ this._toc = v; return this; };
	tag.prototype.__expanded = {'default': true,name: 'expanded'};
	tag.prototype.expanded = function(v){ return this._expanded; }
	tag.prototype.setExpanded = function(v){ this._expanded = v; return this; }
	tag.prototype._expanded = true;
	tag.prototype.level = function(v){ return this.getAttribute('level'); }
	tag.prototype.setLevel = function(v){ this.setAttribute('level',v); return this; };
	
	tag.prototype.route = function (){
		return ("/guide/" + (this.data().route) + "#" + (this.toc().slug));
	};
	
	tag.prototype.toc = function (){
		return this._toc || this.data().toc[0];
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).flag('toc').flag('entry').setLevel((self.toc().level)).setChildren([
			($[0] || _1('a',$,0,self)).setHref(self.route()).setContent(self.toc().title,3).end(),
			(self.toc().children.length && self.toc().level < 2 && self.expanded()) ? (
				($[1] || _1('ul',$,1,self)).setContent((function($0) {
					var $$ = $0.$iter();
					for (let i = 0, items = iter$(self.toc().children), len = items.length, child; i < len; i++) {
						child = items[i];
						if (child.level >= 3) { continue; };
						$$.push(($0[i] || _1(TOC,$0,i)).bindData(self,'data',[]).setToc(child).end());
					};return $$;
				})($[2] || _2($,2,$[1])),5).end()
			) : void(0)
		],1).synced();
	};
});

var GuidesPage = Imba.defineTag('GuidesPage', Page, function(tag){
	
	tag.prototype.mount = function (){
		var self = this;
		self._onscroll || (self._onscroll = function() { return self.scrolled(); });
		return window.addEventListener('scroll',self._onscroll,{passive: true});
	};
	
	tag.prototype.unmount = function (){
		return window.removeEventListener('scroll',this._onscroll,{passive: true});
	};
	
	tag.prototype.guide = function (){
		return this.data()[this.router().path().replace('/guide/','')] || this.data()['essentials/introduction'];
	};
	
	tag.prototype.scrolled = function (){
		return this;
		
		var items = this.dom().querySelectorAll('[id]');
		var match;
		
		var scrollTop = window.pageYOffset;
		var wh = window.innerHeight;
		var dh = document.body.scrollHeight;
		
		if (this._scrollFreeze >= 0) {
			var diff = Math.abs(scrollTop - this._scrollFreeze);
			if (diff < 50) { return this };
			this._scrollFreeze = -1;
		};
		
		var scrollBottom = dh - (scrollTop + wh);
		
		if (scrollBottom == 0) {
			match = items[len$(items) - 1];
		} else {
			for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
				item = ary[i];
				var t = (item.offsetTop + 30 + 60); // hack
				var dist = scrollTop - t;
				
				if (dist < 0) {
					match = item;break;
				};
			};
		};
		
		if (match) {
			if (this._hash != match.id) {
				this._hash = match.id;
				this.router().go('#' + this._hash,{},true);
				this.render();
			};
		};
		
		return this;
	};
	
	tag.prototype.onroute = function (e){
		var self = this;
		e.stop();
		self.log('guides routed');
		var scroll = function() {
			var el;
			if (el = self.dom().querySelector('#' + self.router().hash())) {
				el.scrollIntoView(true);
				self._scrollFreeze = window.pageYOffset;
				return el;
			};
			return false;
		};
		
		if (self.router().hash()) {
			// render
			scroll() || setTimeout(scroll,20);
		};
		
		return self;
	};
	// prop guide
	
	tag.prototype.render = function (){
		var $ = this.$, self = this, $1;
		let curr = self.guide();
		
		return self.$open(0).flag('_page').setChildren($.$ = $.$ || [
			self._nav = self._nav||_1('nav',self).flag('nav').setContent(
				$[0] || _1('div',$,0,self._nav).flag('content')
			,2),
			_1('div',$,3,self).flag('body').flag('light')
		],2).synced((
			self._nav.end((
				$[0].setContent(
					(function($0,$1,$$) {
						var t0;
						for (let i = 0, items = iter$(self.data().toc), len = items.length, item; i < len; i++) {
							item = items[i];
							$$.push(($0[i] || _1('h1',$0,i)).setContent(item.title || item.id,3).end());
							$$.push((t0 = $1[i] || (t0=_1('ul',$1,i))).setContent(
								(function($0) {
									for (let j = 0, ary = iter$(item.sections), len = $0.taglen = ary.length, section; j < len; j++) {
										section = ary[j];
										($0[j] || _1(TOC,$0,j)).bindData(self.data(),section).setExpanded((self.data()[section] == curr)).end();
									};return $0;
								})(t0.$['A'] || _3(t0.$,'A',$1[i]))
							,4).end());
						};return $$;
					})($[1] || _3($,1,$[0]),$[2] || _3($,2,$[0]),_4())
				// for guide in data
				//	<TOC[guide] toc=guide:toc[0] expanded=(guide == curr)>
				,5).end()
			,true)),
			$[3].setContent(
				self.guide() ? (
					($[($1 = '4$' + self.guide().id)] || _1(Guide,$,$1,3)).bindData(self,'guide',[]).end()
				) : void(0)
			,3).end()
		,true));
	};
})
exports.GuidesPage = GuidesPage;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _3 = Imba.createTagMap, _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;

function pathToAnchor(path){
	return 'api-' + path.replace(/\./g,'_').replace(/\#/g,'__').replace(/\=/g,'_set');
};

var Desc = Imba.defineTag('Desc', function(tag){
	
	tag.prototype.setHtml = function (html){
		if (html != this._html) {
			this.dom().innerHTML = this._html = html;
		};
		this;
		return this;
	};
});

var Ref = Imba.defineTag('Ref', function(tag){
	
	tag.prototype.render = function (){
		return this.$open(0).synced();
	};
});

var Item = Imba.defineTag('Item');

var Path = Imba.defineTag('Path', 'span', function(tag){
	tag.prototype.short = function(v){ return this._short; }
	tag.prototype.setShort = function(v){ this._short = v; return this; };
	
	tag.prototype.setup = function (){
		var items = [];
		var str = this.data();
		if ((typeof str=='string'||str instanceof String)) {
			if (this.short()) {
				str = str.replace(/([A-Z]\w*\.)*(?=[A-Z])/g,'');
			};
			
			this.setHtml(str.replace(/\b([\w]+|\.|\#)\b/g,function(m,i) {
				if (i == '.' || i == '#') {
					return ("<i>" + i + "</i>");
				} else if (i[0] == i[0].toUpperCase()) {
					return ("<b class='const'>" + i + "</b>");
				} else {
					return ("<b class='id'>" + i + "</b>");
				};
			}));
		};
		return this;
	};
});


var Return = Imba.defineTag('Return', function(tag){
	tag.prototype.name = function(v){ return this.getAttribute('name'); }
	tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1(Path,$,0,this).flag('value'),
			_1('span',$,1,this).flag('desc')
		],2).synced((
			$[0].bindData(this.data(),'value').end(),
			$[1].setContent(this.data().desc,3).end()
		,true));
	};
});

var Class = Imba.defineTag('Class', Item, function(tag){
	
	tag.prototype.__data = {watch: 'parse',name: 'data'};
	tag.prototype.data = function(v){ return this._data; }
	tag.prototype.setData = function(v){
		var a = this.data();
		if(v != a) { this._data = v; }
		if(v != a) { this.parse && this.parse(v,a,this.__data) }
		return this;
	};
	
	tag.prototype.parse = function (){
		let res = [];
		for (let i = 0, items = iter$(this.data()['.']), len = items.length, m; i < len; i++) {
			m = items[i];
			if (!m.desc) { continue; };
			res.push(m);
		};
		this._statics = res;
		let res1 = [];
		for (let i = 0, items = iter$(this.data()['#']), len = items.length, m; i < len; i++) {
			m = items[i];
			if (!m.desc) { continue; };
			res1.push(m);
		};
		this._methods = res1;
		this._properties = [];
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).setChildren([
			($[0] || _1('span',$,0,self).flag('toc-anchor')).setId(pathToAnchor(self.data().namepath)).end(),
			($[1] || _1('div',$,1,self).flag('header').setContent($[2] || _1('div',$,2,1).flag('title').setContent($[3] || _1(Path,$,3,2),2),2)).end((
				$[2].end((
					$[3].bindData(self.data(),'namepath').end()
				,true))
			,true)),
			($[4] || _1(Desc,$,4,self)).setHtml(self.data().html).end(),
			self.data().ctor ? (
				($[5] || _1('div',$,5,self).flag('content').flag('ctor').setContent(
					$[6] || _1(Method,$,6,5)
				,2)).end((
					$[6].bindData(self.data(),'ctor').setPath((self.data().namepath + '.new')).end()
				,true))
			) : void(0),
			
			($[7] || _1('div',$,7,self).flag('content')).setContent([
				(self._statics.length > 0) ? (
					($[8] || _1('div',$,8,7).flag('section').setContent([
						_1('h2',$,9,8).flag('header').setText('Static Methods'),
						_1('div',$,10,8).flag('content').flag('list')
					],2)).end((
						$[10].setContent((function($0) {
							for (let i = 0, items = iter$(self._statics), len = $0.taglen = items.length; i < len; i++) {
								($0[i] || _1(Method,$0,i).flag('doc')).setData(items[i]).setIname(self.data().namepath).end();
							};return $0;
						})($[11] || _2($,11,$[10])),4).end()
					,true))
				) : void(0),
				
				(self._methods.length > 0) ? (
					($[12] || _1('div',$,12,7).flag('section').setContent([
						_1('h2',$,13,12).flag('header').setText('Instance Methods'),
						_1('div',$,14,12).flag('content').flag('list')
					],2)).end((
						$[14].setContent((function($0) {
							for (let i = 0, items = iter$(self._methods), len = $0.taglen = items.length; i < len; i++) {
								($0[i] || _1(Method,$0,i).flag('doc')).setData(items[i]).setIname(self.data().iname).end();
							};return $0;
						})($[15] || _2($,15,$[14])),4).end()
					,true))
				) : void(0)
			],1).end()
		],1).synced();
	};
});

var Value = Imba.defineTag('Value', function(tag){
	
	tag.prototype.render = function (){
		var data_, $1;
		if (this.data().type) {
			this.$open(0).setFlag(-1,this.data().type).setChildren(
				this.data().value
			,3).synced();
		} else if ((typeof (data_ = this.data())=='string'||data_ instanceof String)) {
			this.$open(1).flag('str').setText(this.data()).synced();
		} else if ((typeof ($1 = this.data())=='number'||$1 instanceof Number)) {
			this.$open(2).flag('num').setText(this.data()).synced();
		};
		return this;
	};
});


var Param = Imba.defineTag('Param', function(tag){
	
	tag.prototype.type = function (){
		return this.data().type;
	};
	
	tag.prototype.render = function (){
		var self = this, $ = this.$;
		return self.$open(0).setFlag(-1,self.type()).setChildren(
			(self.type() == 'NamedParams') ? (
				(function($0) {
					for (let i = 0, items = iter$(self.data().nodes), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1(Param,$0,i)).setData(items[i]).end();
					};return $0;
				})($[0] || _2($,0))
			) : Imba.static([
				($[1] || _1('div',$,1,self).flag('name')).setContent(self.data().name,3).end(),
				self.data().defaults ? Imba.static([
					($[2] || _1('i',$,2,self)).setContent((self.type() == 'NamedParam') ? ': ' : ' = ',3).end(),
					($[3] || _1(Value,$,3,self)).bindData(self.data(),'defaults').end()
				],2,1) : void(0)
			],1,2)
		,3).synced();
	};
});

var Method = Imba.defineTag('Method', Item, function(tag){
	
	tag.prototype.iname = function(v){ return this._iname; }
	tag.prototype.setIname = function(v){ this._iname = v; return this; };
	tag.prototype.path = function(v){ return this._path; }
	tag.prototype.setPath = function(v){ this._path = v; return this; };
	
	tag.prototype.tags = function (){
		let $ = this.$$ || (this.$$ = {}), t0;
		return (t0 = this._tags = this._tags||(t0=_1('div',this)).flag('tags')).setContent([
			this.data().return ? ((t0.$.A || _1(Return,t0.$,'A',t0).setName('returns')).bindData(this.data(),'return').end()) : void(0),
			
			this.data().deprecated ? (
				(t0.$.B || _1('div',t0.$,'B',t0).flag('deprecated').flag('red').setText('Method is deprecated'))
			) : void(0),
			this.data().private ? (
				(t0.$.C || _1('div',t0.$,'C',t0).flag('private').flag('red').setText('Method is private'))
			) : void(0)
		],1).end();
	};
	
	
	tag.prototype.path = function (){
		return this._path || (this.iname() + '.' + this.data().name);
	};
	
	tag.prototype.slug = function (){
		return pathToAnchor(this.data().namepath);
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).flagIf('deprecated',(self.data().deprecated)).setChildren([
			$[0] || _1('span',$,0,self).flag('toc-anchor'),
			$[1] || _1('div',$,1,self).flag('header').setContent([
				_1(Path,$,2,1),
				_1('div',$,3,1).flag('params'),
				_1('div',$,5,1).flag('grow')
			],2),
			$[6] || _1(Desc,$,6,self).flag('md'),
			self.tags()
		],1).synced((
			$[0].setId(self.slug()).end(),
			$[1].end((
				$[2].bindData(self,'path',[]).end(),
				$[3].setContent((function($0) {
					for (let i = 0, items = iter$(self.data().params), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1(Param,$0,i)).setData(items[i]).end();
					};return $0;
				})($[4] || _2($,4,$[3])),4).end()
			,true)),
			$[6].setHtml(self.data().html).end()
		,true));
	};
});

var Link = Imba.defineTag('Link', 'a', function(tag){
	tag.prototype.short = function(v){ return this._short; }
	tag.prototype.setShort = function(v){ this._short = v; return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		this.$open(0).setHref(("/docs#" + pathToAnchor(this.data().namepath))).setChildren($[0] || _1(Path,$,0,this),2).synced((
			$[0].bindData(this.data(),'namepath').setShort(this.short()).end()
		,true));
		return tag.__super__.render.apply(this,arguments);
	};
	
	tag.prototype.ontap = function (){
		tag.__super__.ontap.apply(this,arguments);
		return this.trigger('refocus');
	};
});

var Group = Imba.defineTag('Group', function(tag){
	
	tag.prototype.ontap = function (){
		return this.toggleFlag('collapsed');
	};
});


var DocsPage = Imba.defineTag('DocsPage', Page, function(tag){
	
	tag.prototype.__version = {'default': 'current',name: 'version'};
	tag.prototype.version = function(v){ return this._version; }
	tag.prototype.setVersion = function(v){ this._version = v; return this; }
	tag.prototype._version = 'current';
	tag.prototype.roots = function(v){ return this._roots; }
	tag.prototype.setRoots = function(v){ this._roots = v; return this; };
	
	tag.prototype.src = function (){
		return ("/api/" + this.version() + ".json");
	};
	
	tag.prototype.docs = function (){
		return this._docs;
	};
	
	tag.prototype.setup = function (){
		this.load();
		return tag.__super__.setup.apply(this,arguments);
	};
	
	tag.prototype.load = async function (){
		var docs = await this.app().fetch(this.src());
		DOCS = this._docs = JSON.parse(JSON.stringify(docs));
		DOCMAP = this._docs.entities;
		this.generate();
		if (true) {
			return this.loaded();
		};
	};
	
	tag.prototype.loaded = function (){
		var el;
		this.render();
		if (document.location.hash) {
			if (el = this.dom().querySelector(document.location.hash)) {
				el.scrollIntoView();
			};
		};
		return this;
	};
	
	tag.prototype.onrefocus = function (e){
		return this.refocus();
	};
	
	tag.prototype.refocus = function (){
		var el;
		if (el = this.dom().querySelector(document.location.hash)) {
			el.scrollIntoView();
		};
		return this;
	};
	
	tag.prototype.lookup = function (path){
		return this.docs().entities[path];
	};
	
	tag.prototype.generate = function (){
		this._roots = [];
		var ents = this._docs.entities;
		
		for (let o = this.docs().entities, item, i = 0, keys = Object.keys(o), l = keys.length, path; i < l; i++){
			path = keys[i];item = o[path];if (item.type == 'class' || path == 'Imba') {
				item['.'] = (item['.'] || []).sort().map(function(path) { return ents[path]; }).filter(function(v) { return v.type == 'method' && v.desc; });
				item['#'] = (item['#'] || []).sort().map(function(path) { return ents[path]; }).filter(function(v) { return v.type == 'method' && v.desc; });
				
				if (item.desc) { this._roots.push(item) };
			};
		};
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		if (!(self.docs())) { return self };
		
		return self.$open(0).setChildren($.$ = $.$ || [
			self._nav = self._nav||_1('nav',self).flag('nav').setContent($[0] || _1('div',$,0,self._nav).flag('content'),2),
			_1('div',$,2,self).flag('body')
		],2).synced((
			self._nav.end((
				$[0].setContent(
					(function($0) {
						var t0;
						for (let i = 0, items = iter$(self.roots()), len = $0.taglen = items.length, root; i < len; i++) {
							root = items[i];
							(t0 = $0[i] || (t0=_1(Group,$0,i)).flag('toc').flag('class').flag('section').flag('compact').setContent([
								_1('div',t0.$,'A',t0).flag('header').setContent(t0.$.B || _1(Link,t0.$,'B','A').flag('class'),2),
								_1('div',t0.$,'C',t0).flag('content').setContent([
									_1('div',t0.$,'D','C').flag('static'),
									_1('div',t0.$,'F','C').flag('instance')
								],2)
							],2)).end((
								t0.$.A.end((
									t0.$.B.setData(root).end()
								,true)),
								t0.$.C.end((
									t0.$.D.setContent(
										(function($0) {
											var t1, $$ = $0.$iter();
											for (let j = 0, ary = iter$(root['.']), len = ary.length, meth; j < len; j++) {
												meth = ary[j];
												if (!(meth.desc && !meth.private)) { continue; };
												$$.push((t1 = $0[j] || (t1=_1('div',$0,j)).flag('entry').setContent(t1.$.A || _1(Link,t1.$,'A',t1).setShort(true),2)).end((
													t1.$.A.setData(meth).end()
												,true)));
											};return $$;
										})(t0.$['E'] || _3(t0.$,'E',t0.$.D))
									,5).end(),
									t0.$.F.setContent(
										(function($0) {
											var t1, $$ = $0.$iter();
											for (let j = 0, ary = iter$(root['#']), len = ary.length, meth; j < len; j++) {
												meth = ary[j];
												if (!(meth.desc && !meth.private)) { continue; };
												$$.push((t1 = $0[j] || (t1=_1('div',$0,j)).flag('entry').setContent(t1.$.A || _1(Link,t1.$,'A',t1).setShort(true),2)).end((
													t1.$.A.setData(meth).end()
												,true)));
											};return $$;
										})(t0.$['G'] || _3(t0.$,'G',t0.$.F))
									,5).end()
								,true))
							,true));
						};return $0;
					})($[1] || _2($,1,$[0]))
				,4).end()
			,true)),
			$[2].setContent(
				(function($0) {
					for (let i = 0, items = iter$(self.roots()), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1(Class,$0,i).flag('doc').flag('l')).setData(items[i]).end();
					};return $0;
				})($[3] || _2($,3,$[2]))
			,4).end()
		,true));
	};
})
exports.DocsPage = DocsPage;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNzE5YmRiZTg5ZTg4MDFiYWE5ODYiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90YWcuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90b3VjaC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3JlY29uY2lsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvcm91dGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL2xlc3Mvc2l0ZS5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQSxPQUFPLFFBQVE7Ozs7Ozs7Ozs7OztJQ0lYLEtBQUs7Ozs7Ozs7Ozs7QUFTVDtRQUNDO0VBQ0M7U0FDQSxLQUFLO0dBRk87Ozs7Ozs7Ozs7O0FBV2Q7UUFDQyxZQUFZLE1BQU07Ozs7Ozs7QUFLbkI7UUFDQyxjQUFjOzs7Ozs7O0FBS2Y7UUFDQyxhQUFhOzs7O0FBR2Q7Q0FDQzs7YUFDWSxJQUFHLElBQUksZUFBZSxNQUFqQyxJQUFJLEdBQUcsRUFBRTs7O0NBRVYsSUFBSSxVQUFVLEVBQUUsT0FBTyxPQUFPLElBQUk7Q0FDbEMsSUFBSSxVQUFVLEVBQUUsSUFBSSxVQUFVLFVBQVUsRUFBRSxJQUFJO0NB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsRUFBRTtBQUNuQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVEsT0FBTztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCLDhCQUE4QjtBQUMvQyxpQkFBaUI7QUFD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QUUsS0FBSyxZQUFZLEdBQUksRUFBRTtJQUMvRixVQUFVLEdBQUcsVUFBVSxPQUFPLE9BQUssNEJBQVcsS0FBSyxVQUFRLDRCQUFXLEVBQUUsS0FBSyxZQUFZLEdBQUksRUFBRTs7SUFFN0UsSUFBRyxLQUFLLGFBQTFCLE9BQU8sS0FBSzs7Ozs7O0NBR2Y7O0VBQ2EsTUFBTzs7O1FBR2Qsd0ZBQU87c0JBV1Y7O1FBWEc7Ozs7TUFDSCw4QkFBWTs7MENBQ0wsWUFBSSxjQUFNLGdCQUFROzhCQUN0QiwwREFBb0I7OEJBQ3BCO2dDQUNDO2dDQUdBOzs7Ozs7Ozs7O1dBRkEsNEJBQVk7O2tCQUFlLEtBQUssS0FBSyxJQUFLLEtBQUs7dURBQzdDLHdEQUFvQixTQUFNOzs7Ozs7Ozs7V0FFNUIsNEJBQVk7O2tCQUFlLEtBQUssS0FBSyxJQUFLLEtBQUs7dURBQzdDLHdEQUFvQixTQUFNOzs7Ozs7Ozs7Ozs7OztLQUVoQyw4QkFBWTsrQkFDQyxZQUFJOzs7Ozs7Ozs7Ozs7OztBQ25PckIseUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDcxOWJkYmU4OWU4ODAxYmFhOTg2IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlIFwiLi9zcmMvaW1iYS9pbmRleC5pbWJhXCJcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9pbWJhLmltYmEiLCIjIyNcbkltYmEgaXMgdGhlIG5hbWVzcGFjZSBmb3IgYWxsIHJ1bnRpbWUgcmVsYXRlZCB1dGlsaXRpZXNcbkBuYW1lc3BhY2VcbiMjI1xudmFyIEltYmEgPSB7VkVSU0lPTjogJzEuMy4wLWJldGEuMTInfVxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldFRpbWVvdXQgdGhhdCBleHBlY3RzIHRoZSBibG9jayAvIGZ1bmN0aW9uXG5hcyBsYXN0IGFyZ3VtZW50IChpbnN0ZWFkIG9mIGZpcnN0KS4gSXQgYWxzbyB0cmlnZ2VycyBhbiBldmVudCB0byBJbWJhXG5hZnRlciB0aGUgdGltZW91dCB0byBsZXQgc2NoZWR1bGVycyB1cGRhdGUgKHRvIHJlcmVuZGVyIGV0YykgYWZ0ZXJ3YXJkcy5cblxuIyMjXG5kZWYgSW1iYS5zZXRUaW1lb3V0IGRlbGF5LCAmYmxvY2tcblx0c2V0VGltZW91dCgmLGRlbGF5KSBkb1xuXHRcdGJsb2NrKClcblx0XHRJbWJhLmNvbW1pdFxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldEludGVydmFsIHRoYXQgZXhwZWN0cyB0aGUgYmxvY2sgLyBmdW5jdGlvblxuYXMgbGFzdCBhcmd1bWVudCAoaW5zdGVhZCBvZiBmaXJzdCkuIEl0IGFsc28gdHJpZ2dlcnMgYW4gZXZlbnQgdG8gSW1iYVxuYWZ0ZXIgZXZlcnkgaW50ZXJ2YWwgdG8gbGV0IHNjaGVkdWxlcnMgdXBkYXRlICh0byByZXJlbmRlciBldGMpIGFmdGVyd2FyZHMuXG5cbiMjI1xuZGVmIEltYmEuc2V0SW50ZXJ2YWwgaW50ZXJ2YWwsICZibG9ja1xuXHRzZXRJbnRlcnZhbChibG9jayxpbnRlcnZhbClcblxuIyMjXG5DbGVhciBpbnRlcnZhbCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhckludGVydmFsIGlkXG5cdGNsZWFySW50ZXJ2YWwoaWQpXG5cbiMjI1xuQ2xlYXIgdGltZW91dCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhclRpbWVvdXQgaWRcblx0Y2xlYXJUaW1lb3V0KGlkKVxuXG5cbmRlZiBJbWJhLnN1YmNsYXNzIG9iaiwgc3VwXG5cdGZvciBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID0gdiBpZiBzdXAuaGFzT3duUHJvcGVydHkoaylcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0cmV0dXJuIG9ialxuXG4jIyNcbkxpZ2h0d2VpZ2h0IG1ldGhvZCBmb3IgbWFraW5nIGFuIG9iamVjdCBpdGVyYWJsZSBpbiBpbWJhcyBmb3IvaW4gbG9vcHMuXG5JZiB0aGUgY29tcGlsZXIgY2Fubm90IHNheSBmb3IgY2VydGFpbiB0aGF0IGEgdGFyZ2V0IGluIGEgZm9yIGxvb3AgaXMgYW5cbmFycmF5LCBpdCB3aWxsIGNhY2hlIHRoZSBpdGVyYWJsZSB2ZXJzaW9uIGJlZm9yZSBsb29waW5nLlxuXG5gYGBpbWJhXG4jIHRoaXMgaXMgdGhlIHdob2xlIG1ldGhvZFxuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbmNsYXNzIEN1c3RvbUl0ZXJhYmxlXG5cdGRlZiB0b0FycmF5XG5cdFx0WzEsMiwzXVxuXG4jIHdpbGwgcmV0dXJuIFsyLDQsNl1cbmZvciB4IGluIEN1c3RvbUl0ZXJhYmxlLm5ld1xuXHR4ICogMlxuXG5gYGBcbiMjI1xuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbiMjI1xuQ29lcmNlcyBhIHZhbHVlIGludG8gYSBwcm9taXNlLiBJZiB2YWx1ZSBpcyBhcnJheSBpdCB3aWxsXG5jYWxsIGBQcm9taXNlLmFsbCh2YWx1ZSlgLCBvciBpZiBpdCBpcyBub3QgYSBwcm9taXNlIGl0IHdpbGxcbndyYXAgdGhlIHZhbHVlIGluIGBQcm9taXNlLnJlc29sdmUodmFsdWUpYC4gVXNlZCBmb3IgZXhwZXJpbWVudGFsXG5hd2FpdCBzeW50YXguXG5AcmV0dXJuIHtQcm9taXNlfVxuIyMjXG5kZWYgSW1iYS5hd2FpdCB2YWx1ZVxuXHRpZiB2YWx1ZSBpc2EgQXJyYXlcblx0XHRjb25zb2xlLndhcm4oXCJhd2FpdCAoQXJyYXkpIGlzIGRlcHJlY2F0ZWQgLSB1c2UgYXdhaXQgUHJvbWlzZS5hbGwoQXJyYXkpXCIpXG5cdFx0UHJvbWlzZS5hbGwodmFsdWUpXG5cdGVsaWYgdmFsdWUgYW5kIHZhbHVlOnRoZW5cblx0XHR2YWx1ZVxuXHRlbHNlXG5cdFx0UHJvbWlzZS5yZXNvbHZlKHZhbHVlKVxuXG52YXIgZGFzaFJlZ2V4ID0gLy0uL2dcbnZhciBzZXR0ZXJDYWNoZSA9IHt9XG5cbmRlZiBJbWJhLnRvQ2FtZWxDYXNlIHN0clxuXHRpZiBzdHIuaW5kZXhPZignLScpID49IDBcblx0XHRzdHIucmVwbGFjZShkYXNoUmVnZXgpIGRvIHxtfCBtLmNoYXJBdCgxKS50b1VwcGVyQ2FzZVxuXHRlbHNlXG5cdFx0c3RyXG5cdFx0XG5kZWYgSW1iYS50b1NldHRlciBzdHJcblx0c2V0dGVyQ2FjaGVbc3RyXSB8fD0gSW1iYS50b0NhbWVsQ2FzZSgnc2V0LScgKyBzdHIpXG5cbmRlZiBJbWJhLmluZGV4T2YgYSxiXG5cdHJldHVybiAoYiAmJiBiOmluZGV4T2YpID8gYi5pbmRleE9mKGEpIDogW106aW5kZXhPZi5jYWxsKGEsYilcblxuZGVmIEltYmEubGVuIGFcblx0cmV0dXJuIGEgJiYgKGE6bGVuIGlzYSBGdW5jdGlvbiA/IGE6bGVuLmNhbGwoYSkgOiBhOmxlbmd0aCkgb3IgMFxuXG5kZWYgSW1iYS5wcm9wIHNjb3BlLCBuYW1lLCBvcHRzXG5cdGlmIHNjb3BlOmRlZmluZVByb3BlcnR5XG5cdFx0cmV0dXJuIHNjb3BlLmRlZmluZVByb3BlcnR5KG5hbWUsb3B0cylcblx0cmV0dXJuXG5cbmRlZiBJbWJhLmF0dHIgc2NvcGUsIG5hbWUsIG9wdHMgPSB7fVxuXHRpZiBzY29wZTpkZWZpbmVBdHRyaWJ1dGVcblx0XHRyZXR1cm4gc2NvcGUuZGVmaW5lQXR0cmlidXRlKG5hbWUsb3B0cylcblxuXHRsZXQgZ2V0TmFtZSA9IEltYmEudG9DYW1lbENhc2UobmFtZSlcblx0bGV0IHNldE5hbWUgPSBJbWJhLnRvQ2FtZWxDYXNlKCdzZXQtJyArIG5hbWUpXG5cdGxldCBwcm90byA9IHNjb3BlOnByb3RvdHlwZVxuXG5cdGlmIG9wdHM6ZG9tXG5cdFx0cHJvdG9bZ2V0TmFtZV0gPSBkbyB0aGlzLmRvbVtuYW1lXVxuXHRcdHByb3RvW3NldE5hbWVdID0gZG8gfHZhbHVlfFxuXHRcdFx0aWYgdmFsdWUgIT0gdGhpc1tuYW1lXSgpXG5cdFx0XHRcdHRoaXMuZG9tW25hbWVdID0gdmFsdWVcblx0XHRcdHJldHVybiB0aGlzXG5cdGVsc2Vcblx0XHRwcm90b1tnZXROYW1lXSA9IGRvIHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpXG5cdFx0cHJvdG9bc2V0TmFtZV0gPSBkbyB8dmFsdWV8XG5cdFx0XHR0aGlzLnNldEF0dHJpYnV0ZShuYW1lLHZhbHVlKVxuXHRcdFx0cmV0dXJuIHRoaXNcblx0cmV0dXJuXG5cbmRlZiBJbWJhLnByb3BEaWRTZXQgb2JqZWN0LCBwcm9wZXJ0eSwgdmFsLCBwcmV2XG5cdGxldCBmbiA9IHByb3BlcnR5OndhdGNoXG5cdGlmIGZuIGlzYSBGdW5jdGlvblxuXHRcdGZuLmNhbGwob2JqZWN0LHZhbCxwcmV2LHByb3BlcnR5KVxuXHRlbGlmIGZuIGlzYSBTdHJpbmcgYW5kIG9iamVjdFtmbl1cblx0XHRvYmplY3RbZm5dKHZhbCxwcmV2LHByb3BlcnR5KVxuXHRyZXR1cm5cblxuXG4jIEJhc2ljIGV2ZW50c1xuZGVmIGVtaXRfXyBldmVudCwgYXJncywgbm9kZVxuXHQjIHZhciBub2RlID0gY2JzW2V2ZW50XVxuXHR2YXIgcHJldiwgY2IsIHJldFxuXG5cdHdoaWxlIChwcmV2ID0gbm9kZSkgYW5kIChub2RlID0gbm9kZTpuZXh0KVxuXHRcdGlmIGNiID0gbm9kZTpsaXN0ZW5lclxuXHRcdFx0aWYgbm9kZTpwYXRoIGFuZCBjYltub2RlOnBhdGhdXG5cdFx0XHRcdHJldCA9IGFyZ3MgPyBjYltub2RlOnBhdGhdLmFwcGx5KGNiLGFyZ3MpIDogY2Jbbm9kZTpwYXRoXSgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdCMgY2hlY2sgaWYgaXQgaXMgYSBtZXRob2Q/XG5cdFx0XHRcdHJldCA9IGFyZ3MgPyBjYi5hcHBseShub2RlLCBhcmdzKSA6IGNiLmNhbGwobm9kZSlcblxuXHRcdGlmIG5vZGU6dGltZXMgJiYgLS1ub2RlOnRpbWVzIDw9IDBcblx0XHRcdHByZXY6bmV4dCA9IG5vZGU6bmV4dFxuXHRcdFx0bm9kZTpsaXN0ZW5lciA9IG51bGxcblx0cmV0dXJuXG5cbiMgbWV0aG9kIGZvciByZWdpc3RlcmluZyBhIGxpc3RlbmVyIG9uIG9iamVjdFxuZGVmIEltYmEubGlzdGVuIG9iaiwgZXZlbnQsIGxpc3RlbmVyLCBwYXRoXG5cdHZhciBjYnMsIGxpc3QsIHRhaWxcblx0Y2JzID0gb2JqOl9fbGlzdGVuZXJzX18gfHw9IHt9XG5cdGxpc3QgPSBjYnNbZXZlbnRdIHx8PSB7fVxuXHR0YWlsID0gbGlzdDp0YWlsIHx8IChsaXN0OnRhaWwgPSAobGlzdDpuZXh0ID0ge30pKVxuXHR0YWlsOmxpc3RlbmVyID0gbGlzdGVuZXJcblx0dGFpbDpwYXRoID0gcGF0aFxuXHRsaXN0OnRhaWwgPSB0YWlsOm5leHQgPSB7fVxuXHRyZXR1cm4gdGFpbFxuXG4jIHJlZ2lzdGVyIGEgbGlzdGVuZXIgb25jZVxuZGVmIEltYmEub25jZSBvYmosIGV2ZW50LCBsaXN0ZW5lclxuXHR2YXIgdGFpbCA9IEltYmEubGlzdGVuKG9iaixldmVudCxsaXN0ZW5lcilcblx0dGFpbDp0aW1lcyA9IDFcblx0cmV0dXJuIHRhaWxcblxuIyByZW1vdmUgYSBsaXN0ZW5lclxuZGVmIEltYmEudW5saXN0ZW4gb2JqLCBldmVudCwgY2IsIG1ldGhcblx0dmFyIG5vZGUsIHByZXZcblx0dmFyIG1ldGEgPSBvYmo6X19saXN0ZW5lcnNfX1xuXHRyZXR1cm4gdW5sZXNzIG1ldGFcblxuXHRpZiBub2RlID0gbWV0YVtldmVudF1cblx0XHR3aGlsZSAocHJldiA9IG5vZGUpIGFuZCAobm9kZSA9IG5vZGU6bmV4dClcblx0XHRcdGlmIG5vZGUgPT0gY2IgfHwgbm9kZTpsaXN0ZW5lciA9PSBjYlxuXHRcdFx0XHRwcmV2Om5leHQgPSBub2RlOm5leHRcblx0XHRcdFx0IyBjaGVjayBmb3IgY29ycmVjdCBwYXRoIGFzIHdlbGw/XG5cdFx0XHRcdG5vZGU6bGlzdGVuZXIgPSBudWxsXG5cdFx0XHRcdGJyZWFrXG5cdHJldHVyblxuXG4jIGVtaXQgZXZlbnRcbmRlZiBJbWJhLmVtaXQgb2JqLCBldmVudCwgcGFyYW1zXG5cdGlmIHZhciBjYiA9IG9iajpfX2xpc3RlbmVyc19fXG5cdFx0ZW1pdF9fKGV2ZW50LHBhcmFtcyxjYltldmVudF0pIGlmIGNiW2V2ZW50XVxuXHRcdGVtaXRfXyhldmVudCxbZXZlbnQscGFyYW1zXSxjYjphbGwpIGlmIGNiOmFsbCAjIGFuZCBldmVudCAhPSAnYWxsJ1xuXHRyZXR1cm5cblxuZGVmIEltYmEub2JzZXJ2ZVByb3BlcnR5IG9ic2VydmVyLCBrZXksIHRyaWdnZXIsIHRhcmdldCwgcHJldlxuXHRpZiBwcmV2IGFuZCB0eXBlb2YgcHJldiA9PSAnb2JqZWN0J1xuXHRcdEltYmEudW5saXN0ZW4ocHJldiwnYWxsJyxvYnNlcnZlcix0cmlnZ2VyKVxuXHRpZiB0YXJnZXQgYW5kIHR5cGVvZiB0YXJnZXQgPT0gJ29iamVjdCdcblx0XHRJbWJhLmxpc3Rlbih0YXJnZXQsJ2FsbCcsb2JzZXJ2ZXIsdHJpZ2dlcilcblx0c2VsZlxuXG5tb2R1bGU6ZXhwb3J0cyA9IEltYmFcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsImV4cG9ydCB0YWcgUGFnZVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9QYWdlLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbmNsYXNzIEltYmEuUG9pbnRlclxuXHRcblx0ZGVmIGluaXRpYWxpemVcblx0XHRAYnV0dG9uID0gLTFcblx0XHRAZXZlbnQgPSB7eDogMCwgeTogMCwgdHlwZTogJ3VuaW5pdGlhbGl6ZWQnfVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGJ1dHRvblxuXHRcdEBidXR0b25cblxuXHRkZWYgdG91Y2hcblx0XHRAdG91Y2hcblxuXHRkZWYgdXBkYXRlIGVcblx0XHRAZXZlbnQgPSBlXG5cdFx0QGRpcnR5ID0geWVzXG5cdFx0c2VsZlxuXG5cdCMgdGhpcyBpcyBqdXN0IGZvciByZWd1bGFyIG1vdXNlIG5vd1xuXHRkZWYgcHJvY2Vzc1xuXHRcdHZhciBlMSA9IEBldmVudFxuXG5cdFx0aWYgQGRpcnR5XG5cdFx0XHRAcHJldkV2ZW50ID0gZTFcblx0XHRcdEBkaXJ0eSA9IG5vXG5cblx0XHRcdCMgYnV0dG9uIHNob3VsZCBvbmx5IGNoYW5nZSBvbiBtb3VzZWRvd24gZXRjXG5cdFx0XHRpZiBlMTp0eXBlID09ICdtb3VzZWRvd24nXG5cdFx0XHRcdEBidXR0b24gPSBlMTpidXR0b25cblxuXHRcdFx0XHRpZiAoQHRvdWNoIGFuZCBAYnV0dG9uICE9IDApXG5cdFx0XHRcdFx0cmV0dXJuXG5cblx0XHRcdFx0IyBjYW5jZWwgdGhlIHByZXZpb3VzIHRvdWNoXG5cdFx0XHRcdEB0b3VjaC5jYW5jZWwgaWYgQHRvdWNoXG5cdFx0XHRcdEB0b3VjaCA9IEltYmEuVG91Y2gubmV3KGUxLHNlbGYpXG5cdFx0XHRcdEB0b3VjaC5tb3VzZWRvd24oZTEsZTEpXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2Vtb3ZlJ1xuXHRcdFx0XHRAdG91Y2gubW91c2Vtb3ZlKGUxLGUxKSBpZiBAdG91Y2hcblxuXHRcdFx0ZWxpZiBlMTp0eXBlID09ICdtb3VzZXVwJ1xuXHRcdFx0XHRAYnV0dG9uID0gLTFcblxuXHRcdFx0XHRpZiBAdG91Y2ggYW5kIEB0b3VjaC5idXR0b24gPT0gZTE6YnV0dG9uXG5cdFx0XHRcdFx0QHRvdWNoLm1vdXNldXAoZTEsZTEpXG5cdFx0XHRcdFx0QHRvdWNoID0gbnVsbFxuXHRcdFx0XHQjIHRyaWdnZXIgcG9pbnRlcnVwXG5cdFx0ZWxpZiBAdG91Y2hcblx0XHRcdEB0b3VjaC5pZGxlXG5cdFx0c2VsZlxuXG5cdGRlZiB4IGRvIEBldmVudDp4XG5cdGRlZiB5IGRvIEBldmVudDp5XG5cdFxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJleHRlcm4gZXZhbFxuXG5leHBvcnQgdGFnIFNuaXBwZXRcblx0cHJvcCBzcmNcblx0cHJvcCBoZWFkaW5nXG5cdHByb3AgaGxcblx0XG5cdGRlZiBzZWxmLnJlcGxhY2UgZG9tXG5cdFx0bGV0IGltYmEgPSBkb206Zmlyc3RDaGlsZFxuXHRcdGxldCBqcyA9IGltYmE6bmV4dFNpYmxpbmdcblx0XHRsZXQgaGlnaGxpZ2h0ZWQgPSBpbWJhOmlubmVySFRNTFxuXHRcdGxldCByYXcgPSBkb206dGV4dENvbnRlbnRcblx0XHRsZXQgZGF0YSA9XG5cdFx0XHRjb2RlOiByYXdcblx0XHRcdGh0bWw6IGhpZ2hsaWdodGVkXG5cdFx0XHRqczoge1xuXHRcdFx0XHRjb2RlOiBqczp0ZXh0Q29udGVudFxuXHRcdFx0XHRodG1sOiBqczppbm5lckhUTUxcblx0XHRcdH1cblxuXHRcdGxldCBzbmlwcGV0ID0gPFNuaXBwZXRbZGF0YV0+XG5cdFx0ZG9tOnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNuaXBwZXQuZG9tLGRvbSlcblx0XHRyZXR1cm4gc25pcHBldFxuXHRcdFxuXHRkZWYgc2V0dXBcblx0XHRyZW5kZXJcblx0XHRAY29kZS5kb206aW5uZXJIVE1MID0gZGF0YTpodG1sXG5cdFx0cnVuXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcnVuXG5cdFx0dmFyIG9yaWcgPSBJbWJhOm1vdW50XG5cdFx0XG5cdFx0IyB2YXIganMgPSAndmFyIHJlcXVpcmUgPSBmdW5jdGlvbigpeyByZXR1cm4gSW1iYSB9O1xcbicgKyBkYXRhOmpzOmNvZGVcblx0XHR2YXIganMgPSBkYXRhOmpzOmNvZGVcblx0XHRjb25zb2xlLmxvZyBJbWJhXG5cdFx0anMgPSBqcy5yZXBsYWNlKFwicmVxdWlyZSgnaW1iYScpXCIsJ3dpbmRvdy5JbWJhJylcblx0XHR0cnlcblx0XHRcdEltYmE6bW91bnQgPSBkbyB8aXRlbXwgb3JpZy5jYWxsKEltYmEsaXRlbSxAcmVzdWx0LmRvbSlcblx0XHRcdGNvbnNvbGUubG9nIFwicnVuIGNvZGVcIiwganNcblx0XHRcdGV2YWwoanMpXG5cdFx0XG5cdFx0SW1iYTptb3VudCA9IG9yaWdcblx0XHRzZWxmXG5cblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYuc25pcHBldD5cblx0XHRcdDxjb2RlQGNvZGU+XG5cdFx0XHQ8ZGl2QHJlc3VsdC5zdHlsZWQtZXhhbXBsZT5cblx0XHRcbmV4cG9ydCB0YWcgRXhhbXBsZSA8IFNuaXBwZXRcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+IFwiRXhhbXBsZVwiXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIlxuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCdcbmltcG9ydCBTaXRlIGZyb20gJy4vdmlld3MvU2l0ZSdcbmRvY3VtZW50OmJvZHk6aW5uZXJIVE1MID0gJycgXG5JbWJhLm1vdW50IDxTaXRlW0FQUCA9IEFwcC5kZXNlcmlhbGl6ZShBUFBDQUNIRSldPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jbGllbnQuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4vaW1iYVwiKVxudmFyIGFjdGl2YXRlID0gbm9cbmlmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG5cdGlmIHdpbmRvdy5JbWJhXG5cdFx0Y29uc29sZS53YXJuIFwiSW1iYSB2e3dpbmRvdy5JbWJhLlZFUlNJT059IGlzIGFscmVhZHkgbG9hZGVkLlwiXG5cdFx0SW1iYSA9IHdpbmRvdy5JbWJhXG5cdGVsc2Vcblx0XHR3aW5kb3cuSW1iYSA9IEltYmFcblx0XHRhY3RpdmF0ZSA9IHllc1xuXHRcdGlmIHdpbmRvdzpkZWZpbmUgYW5kIHdpbmRvdzpkZWZpbmU6YW1kXG5cdFx0XHR3aW5kb3cuZGVmaW5lKFwiaW1iYVwiLFtdKSBkbyByZXR1cm4gSW1iYVxuXG5tb2R1bGUuZXhwb3J0cyA9IEltYmFcblxudW5sZXNzICR3ZWJ3b3JrZXIkXG5cdHJlcXVpcmUgJy4vc2NoZWR1bGVyJ1xuXHRyZXF1aXJlICcuL2RvbS9pbmRleCdcblxuaWYgJHdlYiQgYW5kIGFjdGl2YXRlXG5cdEltYmEuRXZlbnRNYW5hZ2VyLmFjdGl2YXRlXG5cdFxuaWYgJG5vZGUkXG5cdHVubGVzcyAkd2VicGFjayRcblx0XHRyZXF1aXJlICcuLi8uLi9yZWdpc3Rlci5qcydcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2luZGV4LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuL2ltYmFcIilcblxudmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSAjIHZlcnkgc2ltcGxlIHJhZiBwb2x5ZmlsbFxudmFyIGNhbmNlbEFuaW1hdGlvbkZyYW1lXG5cbmlmICRub2RlJFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZSA9IGRvIHxpZHwgY2xlYXJUaW1lb3V0KGlkKVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBkbyB8YmxrfCBzZXRUaW1lb3V0KGJsaywxMDAwIC8gNjApXG5cbmlmICR3ZWIkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93OmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdzptb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3c6d2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdzpyZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSB3aW5kb3c6d2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gd2luZG93Om1velJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IGRvIHxibGt8IHNldFRpbWVvdXQoYmxrLDEwMDAgLyA2MClcblxuY2xhc3MgVGlja2VyXG5cblx0cHJvcCBzdGFnZVxuXHRwcm9wIHF1ZXVlXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRAcXVldWUgPSBbXVxuXHRcdEBzdGFnZSA9IC0xXG5cdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0QHRpY2tlciA9IGRvIHxlfFxuXHRcdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0XHR0aWNrKGUpXG5cdFx0c2VsZlxuXG5cdGRlZiBhZGQgaXRlbSwgZm9yY2Vcblx0XHRpZiBmb3JjZSBvciBAcXVldWUuaW5kZXhPZihpdGVtKSA9PSAtMVxuXHRcdFx0QHF1ZXVlLnB1c2goaXRlbSlcblxuXHRcdHNjaGVkdWxlIHVubGVzcyBAc2NoZWR1bGVkXG5cblx0ZGVmIHRpY2sgdGltZXN0YW1wXG5cdFx0dmFyIGl0ZW1zID0gQHF1ZXVlXG5cdFx0QHRzID0gdGltZXN0YW1wIHVubGVzcyBAdHNcblx0XHRAZHQgPSB0aW1lc3RhbXAgLSBAdHNcblx0XHRAdHMgPSB0aW1lc3RhbXBcblx0XHRAcXVldWUgPSBbXVxuXHRcdEBzdGFnZSA9IDFcblx0XHRiZWZvcmVcblx0XHRpZiBpdGVtczpsZW5ndGhcblx0XHRcdGZvciBpdGVtLGkgaW4gaXRlbXNcblx0XHRcdFx0aWYgaXRlbSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRpdGVtKEBkdCxzZWxmKVxuXHRcdFx0XHRlbGlmIGl0ZW06dGlja1xuXHRcdFx0XHRcdGl0ZW0udGljayhAZHQsc2VsZilcblx0XHRAc3RhZ2UgPSAyXG5cdFx0YWZ0ZXJcblx0XHRAc3RhZ2UgPSBAc2NoZWR1bGVkID8gMCA6IC0xXG5cdFx0c2VsZlxuXG5cdGRlZiBzY2hlZHVsZVxuXHRcdGlmICFAc2NoZWR1bGVkXG5cdFx0XHRAc2NoZWR1bGVkID0geWVzXG5cdFx0XHRpZiBAc3RhZ2UgPT0gLTFcblx0XHRcdFx0QHN0YWdlID0gMFxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKEB0aWNrZXIpXG5cdFx0c2VsZlxuXG5cdGRlZiBiZWZvcmVcblx0XHRzZWxmXG5cblx0ZGVmIGFmdGVyXG5cdFx0aWYgSW1iYS5UYWdNYW5hZ2VyXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRcdHNlbGZcblxuSW1iYS5USUNLRVIgPSBUaWNrZXIubmV3XG5JbWJhLlNDSEVEVUxFUlMgPSBbXVxuXG5kZWYgSW1iYS50aWNrZXJcblx0SW1iYS5USUNLRVJcblxuZGVmIEltYmEucmVxdWVzdEFuaW1hdGlvbkZyYW1lIGNhbGxiYWNrXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjaylcblxuZGVmIEltYmEuY2FuY2VsQW5pbWF0aW9uRnJhbWUgaWRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpXG5cbiMgc2hvdWxkIGFkZCBhbiBJbWJhLnJ1biAvIHNldEltbWVkaWF0ZSB0aGF0XG4jIHB1c2hlcyBsaXN0ZW5lciBvbnRvIHRoZSB0aWNrLXF1ZXVlIHdpdGggdGltZXMgLSBvbmNlXG5cbnZhciBjb21taXRRdWV1ZSA9IDBcblxuZGVmIEltYmEuY29tbWl0IHBhcmFtc1xuXHRjb21taXRRdWV1ZSsrXG5cdCMgSW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0SW1iYS5lbWl0KEltYmEsJ2NvbW1pdCcscGFyYW1zICE9IHVuZGVmaW5lZCA/IFtwYXJhbXNdIDogdW5kZWZpbmVkKVxuXHRpZiAtLWNvbW1pdFF1ZXVlID09IDBcblx0XHRJbWJhLlRhZ01hbmFnZXIgYW5kIEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdHJldHVyblxuXG4jIyNcblxuSW5zdGFuY2VzIG9mIEltYmEuU2NoZWR1bGVyIG1hbmFnZXMgd2hlbiB0byBjYWxsIGB0aWNrKClgIG9uIHRoZWlyIHRhcmdldCxcbmF0IGEgc3BlY2lmaWVkIGZyYW1lcmF0ZSBvciB3aGVuIGNlcnRhaW4gZXZlbnRzIG9jY3VyLiBSb290LW5vZGVzIGluIHlvdXJcbmFwcGxpY2F0aW9ucyB3aWxsIHVzdWFsbHkgaGF2ZSBhIHNjaGVkdWxlciB0byBtYWtlIHN1cmUgdGhleSByZXJlbmRlciB3aGVuXG5zb21ldGhpbmcgY2hhbmdlcy4gSXQgaXMgYWxzbyBwb3NzaWJsZSB0byBtYWtlIGlubmVyIGNvbXBvbmVudHMgdXNlIHRoZWlyXG5vd24gc2NoZWR1bGVycyB0byBjb250cm9sIHdoZW4gdGhleSByZW5kZXIuXG5cbkBpbmFtZSBzY2hlZHVsZXJcblxuIyMjXG5jbGFzcyBJbWJhLlNjaGVkdWxlclxuXHRcblx0dmFyIGNvdW50ZXIgPSAwXG5cblx0ZGVmIHNlbGYuZXZlbnQgZVxuXHRcdEltYmEuZW1pdChJbWJhLCdldmVudCcsZSlcblxuXHQjIyNcblx0Q3JlYXRlIGEgbmV3IEltYmEuU2NoZWR1bGVyIGZvciBzcGVjaWZpZWQgdGFyZ2V0XG5cdEByZXR1cm4ge0ltYmEuU2NoZWR1bGVyfVxuXHQjIyNcblx0ZGVmIGluaXRpYWxpemUgdGFyZ2V0XG5cdFx0QGlkID0gY291bnRlcisrXG5cdFx0QHRhcmdldCA9IHRhcmdldFxuXHRcdEBtYXJrZWQgPSBub1xuXHRcdEBhY3RpdmUgPSBub1xuXHRcdEBtYXJrZXIgPSBkbyBtYXJrXG5cdFx0QHRpY2tlciA9IGRvIHxlfCB0aWNrKGUpXG5cblx0XHRAZHQgPSAwXG5cdFx0QGZyYW1lID0ge31cblx0XHRAc2NoZWR1bGVkID0gbm9cblx0XHRAdGltZXN0YW1wID0gMFxuXHRcdEB0aWNrcyA9IDBcblx0XHRAZmx1c2hlcyA9IDBcblxuXHRcdHNlbGY6b25ldmVudCA9IHNlbGY6b25ldmVudC5iaW5kKHNlbGYpXG5cdFx0c2VsZlxuXG5cdHByb3AgcmFmIHdhdGNoOiB5ZXNcblx0cHJvcCBpbnRlcnZhbCB3YXRjaDogeWVzXG5cdHByb3AgZXZlbnRzIHdhdGNoOiB5ZXNcblx0cHJvcCBtYXJrZWRcblxuXHRkZWYgcmFmRGlkU2V0IGJvb2xcblx0XHRyZXF1ZXN0VGljayBpZiBib29sIGFuZCBAYWN0aXZlXG5cdFx0c2VsZlxuXG5cdGRlZiBpbnRlcnZhbERpZFNldCB0aW1lXG5cdFx0Y2xlYXJJbnRlcnZhbChAaW50ZXJ2YWxJZClcblx0XHRAaW50ZXJ2YWxJZCA9IG51bGxcblx0XHRpZiB0aW1lIGFuZCBAYWN0aXZlXG5cdFx0XHRAaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHNlbGY6b25pbnRlcnZhbC5iaW5kKHNlbGYpLHRpbWUpXG5cdFx0c2VsZlxuXG5cdGRlZiBldmVudHNEaWRTZXQgbmV3LCBwcmV2XG5cdFx0aWYgQGFjdGl2ZSBhbmQgbmV3IGFuZCAhcHJldlxuXHRcdFx0SW1iYS5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50Jylcblx0XHRlbGlmICFuZXcgYW5kIHByZXZcblx0XHRcdEltYmEudW5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50JylcblxuXHQjIyNcblx0Q2hlY2sgd2hldGhlciB0aGUgY3VycmVudCBzY2hlZHVsZXIgaXMgYWN0aXZlIG9yIG5vdFxuXHRAcmV0dXJuIHtib29sfVxuXHQjIyNcblx0ZGVmIGFjdGl2ZVxuXHRcdEBhY3RpdmVcblxuXHQjIyNcblx0RGVsdGEgdGltZSBiZXR3ZWVuIHRoZSB0d28gbGFzdCB0aWNrc1xuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHRcblx0XHRAZHRcblxuXHQjIyNcblx0Q29uZmlndXJlIHRoZSBzY2hlZHVsZXJcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjb25maWd1cmUgb3B0aW9ucyA9IHt9XG5cdFx0cmFmID0gb3B0aW9uczpyYWYgaWYgb3B0aW9uczpyYWYgIT0gdW5kZWZpbmVkXG5cdFx0aW50ZXJ2YWwgPSBvcHRpb25zOmludGVydmFsIGlmIG9wdGlvbnM6aW50ZXJ2YWwgIT0gdW5kZWZpbmVkXG5cdFx0ZXZlbnRzID0gb3B0aW9uczpldmVudHMgaWYgb3B0aW9uczpldmVudHMgIT0gdW5kZWZpbmVkXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRNYXJrIHRoZSBzY2hlZHVsZXIgYXMgZGlydHkuIFRoaXMgd2lsbCBtYWtlIHN1cmUgdGhhdFxuXHR0aGUgc2NoZWR1bGVyIGNhbGxzIGB0YXJnZXQudGlja2Agb24gdGhlIG5leHQgZnJhbWVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBtYXJrXG5cdFx0QG1hcmtlZCA9IHllc1xuXHRcdGlmICFAc2NoZWR1bGVkXG5cdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHNlbGZcblxuXHQjIyNcblx0SW5zdGFudGx5IHRyaWdnZXIgdGFyZ2V0LnRpY2sgYW5kIG1hcmsgc2NoZWR1bGVyIGFzIGNsZWFuIChub3QgZGlydHkvbWFya2VkKS5cblx0VGhpcyBpcyBjYWxsZWQgaW1wbGljaXRseSBmcm9tIHRpY2ssIGJ1dCBjYW4gYWxzbyBiZSBjYWxsZWQgbWFudWFsbHkgaWYgeW91XG5cdHJlYWxseSB3YW50IHRvIGZvcmNlIGEgdGljayB3aXRob3V0IHdhaXRpbmcgZm9yIHRoZSBuZXh0IGZyYW1lLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZsdXNoXG5cdFx0QGZsdXNoZXMrK1xuXHRcdEB0YXJnZXQudGljayhzZWxmKVxuXHRcdEBtYXJrZWQgPSBub1xuXHRcdHNlbGZcblxuXHQjIyNcblx0QGZpeG1lIHRoaXMgZXhwZWN0cyByYWYgdG8gcnVuIGF0IDYwIGZwcyBcblxuXHRDYWxsZWQgYXV0b21hdGljYWxseSBvbiBldmVyeSBmcmFtZSB3aGlsZSB0aGUgc2NoZWR1bGVyIGlzIGFjdGl2ZS5cblx0SXQgd2lsbCBvbmx5IGNhbGwgYHRhcmdldC50aWNrYCBpZiB0aGUgc2NoZWR1bGVyIGlzIG1hcmtlZCBkaXJ0eSxcblx0b3Igd2hlbiBhY2NvcmRpbmcgdG8gQGZwcyBzZXR0aW5nLlxuXG5cdElmIHlvdSBoYXZlIHNldCB1cCBhIHNjaGVkdWxlciB3aXRoIGFuIGZwcyBvZiAxLCB0aWNrIHdpbGwgc3RpbGwgYmVcblx0Y2FsbGVkIGV2ZXJ5IGZyYW1lLCBidXQgYHRhcmdldC50aWNrYCB3aWxsIG9ubHkgYmUgY2FsbGVkIG9uY2UgZXZlcnlcblx0c2Vjb25kLCBhbmQgaXQgd2lsbCAqbWFrZSBzdXJlKiBlYWNoIGB0YXJnZXQudGlja2AgaGFwcGVucyBpbiBzZXBhcmF0ZVxuXHRzZWNvbmRzIGFjY29yZGluZyB0byBEYXRlLiBTbyBpZiB5b3UgaGF2ZSBhIG5vZGUgdGhhdCByZW5kZXJzIGEgY2xvY2tcblx0YmFzZWQgb24gRGF0ZS5ub3cgKG9yIHNvbWV0aGluZyBzaW1pbGFyKSwgeW91IGNhbiBzY2hlZHVsZSBpdCB3aXRoIDFmcHMsXG5cdG5ldmVyIG5lZWRpbmcgdG8gd29ycnkgYWJvdXQgdHdvIHRpY2tzIGhhcHBlbmluZyB3aXRoaW4gdGhlIHNhbWUgc2Vjb25kLlxuXHRUaGUgc2FtZSBnb2VzIGZvciA0ZnBzLCAxMGZwcyBldGMuXG5cblx0QHByb3RlY3RlZFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHRpY2sgZGVsdGEsIHRpY2tlclxuXHRcdEB0aWNrcysrXG5cdFx0QGR0ID0gZGVsdGFcblxuXHRcdGlmIHRpY2tlclxuXHRcdFx0QHNjaGVkdWxlZCA9IG5vXG5cblx0XHRmbHVzaFxuXG5cdFx0aWYgQHJhZiBhbmQgQGFjdGl2ZVxuXHRcdFx0cmVxdWVzdFRpY2tcblx0XHRzZWxmXG5cblx0ZGVmIHJlcXVlc3RUaWNrXG5cdFx0dW5sZXNzIEBzY2hlZHVsZWRcblx0XHRcdEBzY2hlZHVsZWQgPSB5ZXNcblx0XHRcdEltYmEuVElDS0VSLmFkZChzZWxmKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U3RhcnQgdGhlIHNjaGVkdWxlciBpZiBpdCBpcyBub3QgYWxyZWFkeSBhY3RpdmUuXG5cdCoqV2hpbGUgYWN0aXZlKiosIHRoZSBzY2hlZHVsZXIgd2lsbCBvdmVycmlkZSBgdGFyZ2V0LmNvbW1pdGBcblx0dG8gZG8gbm90aGluZy4gQnkgZGVmYXVsdCBJbWJhLnRhZyNjb21taXQgY2FsbHMgcmVuZGVyLCBzb1xuXHR0aGF0IHJlbmRlcmluZyBpcyBjYXNjYWRlZCB0aHJvdWdoIHRvIGNoaWxkcmVuIHdoZW4gcmVuZGVyaW5nXG5cdGEgbm9kZS4gV2hlbiBhIHNjaGVkdWxlciBpcyBhY3RpdmUgKGZvciBhIG5vZGUpLCBJbWJhIGRpc2FibGVzXG5cdHRoaXMgYXV0b21hdGljIHJlbmRlcmluZy5cblx0IyMjXG5cdGRlZiBhY3RpdmF0ZSBpbW1lZGlhdGUgPSB5ZXNcblx0XHR1bmxlc3MgQGFjdGl2ZVxuXHRcdFx0QGFjdGl2ZSA9IHllc1xuXHRcdFx0QGNvbW1pdCA9IEB0YXJnZXQ6Y29tbWl0XG5cdFx0XHRAdGFyZ2V0OmNvbW1pdCA9IGRvIHRoaXNcblx0XHRcdEB0YXJnZXQ/LmZsYWcoJ3NjaGVkdWxlZF8nKVxuXHRcdFx0SW1iYS5TQ0hFRFVMRVJTLnB1c2goc2VsZilcblx0XHRcdFxuXHRcdFx0aWYgQGV2ZW50c1xuXHRcdFx0XHRJbWJhLmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXHRcdFx0XHRcblx0XHRcdGlmIEBpbnRlcnZhbCBhbmQgIUBpbnRlcnZhbElkXG5cdFx0XHRcdEBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoc2VsZjpvbmludGVydmFsLmJpbmQoc2VsZiksQGludGVydmFsKVxuXG5cdFx0XHRpZiBpbW1lZGlhdGVcblx0XHRcdFx0dGljaygwKVxuXHRcdFx0ZWxpZiBAcmFmXG5cdFx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0U3RvcCB0aGUgc2NoZWR1bGVyIGlmIGl0IGlzIGFjdGl2ZS5cblx0IyMjXG5cdGRlZiBkZWFjdGl2YXRlXG5cdFx0aWYgQGFjdGl2ZVxuXHRcdFx0QGFjdGl2ZSA9IG5vXG5cdFx0XHRAdGFyZ2V0OmNvbW1pdCA9IEBjb21taXRcblx0XHRcdGxldCBpZHggPSBJbWJhLlNDSEVEVUxFUlMuaW5kZXhPZihzZWxmKVxuXHRcdFx0aWYgaWR4ID49IDBcblx0XHRcdFx0SW1iYS5TQ0hFRFVMRVJTLnNwbGljZShpZHgsMSlcblx0XHRcdFx0XG5cdFx0XHRpZiBAZXZlbnRzXG5cdFx0XHRcdEltYmEudW5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50JylcblxuXHRcdFx0aWYgQGludGVydmFsSWRcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbChAaW50ZXJ2YWxJZClcblx0XHRcdFx0QGludGVydmFsSWQgPSBudWxsXG5cdFx0XHRcblx0XHRcdEB0YXJnZXQ/LnVuZmxhZygnc2NoZWR1bGVkXycpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgdHJhY2tcblx0XHRAbWFya2VyXG5cdFx0XG5cdGRlZiBvbmludGVydmFsXG5cdFx0dGlja1xuXHRcdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdFx0c2VsZlxuXG5cdGRlZiBvbmV2ZW50IGV2ZW50XG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBldmVudHMgb3IgQG1hcmtlZFxuXG5cdFx0aWYgQGV2ZW50cyBpc2EgRnVuY3Rpb25cblx0XHRcdG1hcmsgaWYgQGV2ZW50cyhldmVudCxzZWxmKVxuXHRcdGVsaWYgQGV2ZW50cyBpc2EgQXJyYXlcblx0XHRcdGlmIEBldmVudHMuaW5kZXhPZigoZXZlbnQgYW5kIGV2ZW50OnR5cGUpIG9yIGV2ZW50KSA+PSAwXG5cdFx0XHRcdG1hcmtcblx0XHRlbHNlXG5cdFx0XHRtYXJrXG5cdFx0c2VsZlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvc2NoZWR1bGVyLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbnJlcXVpcmUgJy4vbWFuYWdlcidcblxuSW1iYS5UYWdNYW5hZ2VyID0gSW1iYS5UYWdNYW5hZ2VyQ2xhc3MubmV3XG5cbnJlcXVpcmUgJy4vdGFnJ1xucmVxdWlyZSAnLi9odG1sJ1xucmVxdWlyZSAnLi9wb2ludGVyJ1xucmVxdWlyZSAnLi90b3VjaCdcbnJlcXVpcmUgJy4vZXZlbnQnXG5yZXF1aXJlICcuL2V2ZW50LW1hbmFnZXInXG5cbmlmICR3ZWIkXG5cdHJlcXVpcmUgJy4vcmVjb25jaWxlcidcblxuaWYgJG5vZGUkXG5cdHJlcXVpcmUgJy4vc2VydmVyJ1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9pbmRleC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5jbGFzcyBJbWJhLlRhZ01hbmFnZXJDbGFzc1xuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdEBpbnNlcnRzID0gMFxuXHRcdEByZW1vdmVzID0gMFxuXHRcdEBtb3VudGVkID0gW11cblx0XHRAaGFzTW91bnRhYmxlcyA9IG5vXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VudGVkXG5cdFx0QG1vdW50ZWRcblxuXHRkZWYgaW5zZXJ0IG5vZGUsIHBhcmVudFxuXHRcdEBpbnNlcnRzKytcblxuXHRkZWYgcmVtb3ZlIG5vZGUsIHBhcmVudFxuXHRcdEByZW1vdmVzKytcblxuXHRkZWYgY2hhbmdlc1xuXHRcdEBpbnNlcnRzICsgQHJlbW92ZXNcblxuXHRkZWYgbW91bnQgbm9kZVxuXHRcdHJldHVybiBpZiAkbm9kZSRcblx0XHRAaGFzTW91bnRhYmxlcyA9IHllc1xuXG5cdGRlZiByZWZyZXNoIGZvcmNlID0gbm9cblx0XHRyZXR1cm4gaWYgJG5vZGUkXG5cdFx0cmV0dXJuIGlmICFmb3JjZSBhbmQgY2hhbmdlcyA9PSAwXG5cdFx0IyBjb25zb2xlLnRpbWUoJ3Jlc29sdmVNb3VudHMnKVxuXHRcdGlmIChAaW5zZXJ0cyBhbmQgQGhhc01vdW50YWJsZXMpIG9yIGZvcmNlXG5cdFx0XHR0cnlNb3VudFxuXG5cdFx0aWYgKEByZW1vdmVzIG9yIGZvcmNlKSBhbmQgQG1vdW50ZWQ6bGVuZ3RoXG5cdFx0XHR0cnlVbm1vdW50XG5cdFx0IyBjb25zb2xlLnRpbWVFbmQoJ3Jlc29sdmVNb3VudHMnKVxuXHRcdEBpbnNlcnRzID0gMFxuXHRcdEByZW1vdmVzID0gMFxuXHRcdHNlbGZcblxuXHRkZWYgdW5tb3VudCBub2RlXG5cdFx0c2VsZlxuXG5cdGRlZiB0cnlNb3VudFxuXHRcdHZhciBjb3VudCA9IDBcblx0XHR2YXIgcm9vdCA9IGRvY3VtZW50OmJvZHlcblx0XHR2YXIgaXRlbXMgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5fX21vdW50Jylcblx0XHQjIHdoYXQgaWYgd2UgZW5kIHVwIGNyZWF0aW5nIGFkZGl0aW9uYWwgbW91bnRhYmxlcyBieSBtb3VudGluZz9cblx0XHRmb3IgZWwgaW4gaXRlbXNcblx0XHRcdGlmIGVsIGFuZCBlbC5AdGFnXG5cdFx0XHRcdGlmIEBtb3VudGVkLmluZGV4T2YoZWwuQHRhZykgPT0gLTFcblx0XHRcdFx0XHRtb3VudE5vZGUoZWwuQHRhZylcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBtb3VudE5vZGUgbm9kZVxuXHRcdEBtb3VudGVkLnB1c2gobm9kZSlcblx0XHRub2RlLkZMQUdTIHw9IEltYmEuVEFHX01PVU5URURcblx0XHRub2RlLm1vdW50IGlmIG5vZGU6bW91bnRcblx0XHRyZXR1cm5cblxuXHRkZWYgdHJ5VW5tb3VudFxuXHRcdHZhciBjb3VudCA9IDBcblx0XHR2YXIgcm9vdCA9IGRvY3VtZW50OmJvZHlcblx0XHRmb3IgaXRlbSwgaSBpbiBAbW91bnRlZFxuXHRcdFx0dW5sZXNzIGRvY3VtZW50OmRvY3VtZW50RWxlbWVudC5jb250YWlucyhpdGVtLkBkb20pXG5cdFx0XHRcdGl0ZW0uRkxBR1MgPSBpdGVtLkZMQUdTICYgfkltYmEuVEFHX01PVU5URURcblx0XHRcdFx0aWYgaXRlbTp1bm1vdW50IGFuZCBpdGVtLkBkb21cblx0XHRcdFx0XHRpdGVtLnVubW91bnRcblx0XHRcdFx0ZWxpZiBpdGVtLkBzY2hlZHVsZXJcblx0XHRcdFx0XHQjIE1BWUJFIEZJWCBUSElTP1xuXHRcdFx0XHRcdGl0ZW0udW5zY2hlZHVsZVxuXHRcdFx0XHRAbW91bnRlZFtpXSA9IG51bGxcblx0XHRcdFx0Y291bnQrK1xuXHRcdFxuXHRcdGlmIGNvdW50XG5cdFx0XHRAbW91bnRlZCA9IEBtb3VudGVkLmZpbHRlciBkbyB8aXRlbXwgaXRlbVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5JbWJhLkNTU0tleU1hcCA9IHt9XG5cbkltYmEuVEFHX0JVSUxUID0gMVxuSW1iYS5UQUdfU0VUVVAgPSAyXG5JbWJhLlRBR19NT1VOVElORyA9IDRcbkltYmEuVEFHX01PVU5URUQgPSA4XG5JbWJhLlRBR19TQ0hFRFVMRUQgPSAxNlxuSW1iYS5UQUdfQVdBS0VORUQgPSAzMlxuXG4jIyNcbkdldCB0aGUgY3VycmVudCBkb2N1bWVudFxuIyMjXG5kZWYgSW1iYS5kb2N1bWVudFxuXHRpZiAkd2ViJFxuXHRcdHdpbmRvdzpkb2N1bWVudFxuXHRlbHNlXG5cdFx0QGRvY3VtZW50IHx8PSBJbWJhU2VydmVyRG9jdW1lbnQubmV3XG5cbiMjI1xuR2V0IHRoZSBib2R5IGVsZW1lbnQgd3JhcHBlZCBpbiBhbiBJbWJhLlRhZ1xuIyMjXG5kZWYgSW1iYS5yb290XG5cdHRhZyhJbWJhLmRvY3VtZW50OmJvZHkpXG5cbmRlZiBJbWJhLnN0YXRpYyBpdGVtcywgdHlwLCBuclxuXHRpdGVtcy5AdHlwZSA9IHR5cFxuXHRpdGVtczpzdGF0aWMgPSBuclxuXHRyZXR1cm4gaXRlbXNcblxuIyMjXG5cbiMjI1xuZGVmIEltYmEubW91bnQgbm9kZSwgaW50b1xuXHRpbnRvIHx8PSBJbWJhLmRvY3VtZW50OmJvZHlcblx0aW50by5hcHBlbmRDaGlsZChub2RlLmRvbSlcblx0SW1iYS5UYWdNYW5hZ2VyLmluc2VydChub2RlLGludG8pXG5cdG5vZGUuc2NoZWR1bGVyLmNvbmZpZ3VyZShldmVudHM6IHllcykuYWN0aXZhdGUobm8pXG5cdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdHJldHVybiBub2RlXG5cblxuZGVmIEltYmEuY3JlYXRlVGV4dE5vZGUgbm9kZVxuXHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRyZXR1cm4gbm9kZVxuXHRyZXR1cm4gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG4jIyNcblRoaXMgaXMgdGhlIGJhc2VjbGFzcyB0aGF0IGFsbCB0YWdzIGluIGltYmEgaW5oZXJpdCBmcm9tLlxuQGluYW1lIG5vZGVcbiMjI1xuY2xhc3MgSW1iYS5UYWdcblxuXHRkZWYgc2VsZi5idWlsZE5vZGVcblx0XHR2YXIgZG9tID0gSW1iYS5kb2N1bWVudC5jcmVhdGVFbGVtZW50KEBub2RlVHlwZSBvciAnZGl2Jylcblx0XHRpZiBAY2xhc3Nlc1xuXHRcdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0XHRkb206Y2xhc3NOYW1lID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHR2YXIgcHJvdG8gPSAoQHByb3RvRG9tIHx8PSBidWlsZE5vZGUpXG5cdFx0cHJvdG8uY2xvbmVOb2RlKGZhbHNlKVxuXG5cdGRlZiBzZWxmLmJ1aWxkIGN0eFxuXHRcdHNlbGYubmV3KHNlbGYuY3JlYXRlTm9kZSxjdHgpXG5cblx0ZGVmIHNlbGYuZG9tXG5cdFx0QHByb3RvRG9tIHx8PSBidWlsZE5vZGVcblxuXHQjIyNcblx0Q2FsbGVkIHdoZW4gYSB0YWcgdHlwZSBpcyBiZWluZyBzdWJjbGFzc2VkLlxuXHQjIyNcblx0ZGVmIHNlbGYuaW5oZXJpdCBjaGlsZFxuXHRcdGNoaWxkLkBwcm90b0RvbSA9IG51bGxcblxuXHRcdGlmIEBub2RlVHlwZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gQG5vZGVUeXBlXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IEBjbGFzc2VzLnNsaWNlXG5cblx0XHRcdGlmIGNoaWxkLkBmbGFnTmFtZVxuXHRcdFx0XHRjaGlsZC5AY2xhc3Nlcy5wdXNoKGNoaWxkLkBmbGFnTmFtZSlcblx0XHRlbHNlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBjaGlsZC5AbmFtZVxuXHRcdFx0Y2hpbGQuQGZsYWdOYW1lID0gbnVsbFxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBbXVxuXG5cdCMjI1xuXHRJbnRlcm5hbCBtZXRob2QgY2FsbGVkIGFmdGVyIGEgdGFnIGNsYXNzIGhhc1xuXHRiZWVuIGRlY2xhcmVkIG9yIGV4dGVuZGVkLlxuXHRcblx0QHByaXZhdGVcblx0IyMjXG5cdGRlZiBvcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXHRcdHZhciBiYXNlID0gSW1iYS5UYWc6cHJvdG90eXBlXG5cdFx0dmFyIGhhc1NldHVwICA9IHNlbGY6c2V0dXAgICE9IGJhc2U6c2V0dXBcblx0XHR2YXIgaGFzQ29tbWl0ID0gc2VsZjpjb21taXQgIT0gYmFzZTpjb21taXRcblx0XHR2YXIgaGFzUmVuZGVyID0gc2VsZjpyZW5kZXIgIT0gYmFzZTpyZW5kZXJcblx0XHR2YXIgaGFzTW91bnQgID0gc2VsZjptb3VudFxuXG5cdFx0dmFyIGN0b3IgPSBzZWxmOmNvbnN0cnVjdG9yXG5cblx0XHRpZiBoYXNDb21taXQgb3IgaGFzUmVuZGVyIG9yIGhhc01vdW50IG9yIGhhc1NldHVwXG5cblx0XHRcdHNlbGY6ZW5kID0gZG9cblx0XHRcdFx0aWYgdGhpczptb3VudCBhbmQgISh0aGlzLkZMQUdTICYgSW1iYS5UQUdfTU9VTlRFRClcblx0XHRcdFx0XHQjIGp1c3QgYWN0aXZhdGUgXG5cdFx0XHRcdFx0SW1iYS5UYWdNYW5hZ2VyLm1vdW50KHRoaXMpXG5cblx0XHRcdFx0dW5sZXNzIHRoaXMuRkxBR1MgJiBJbWJhLlRBR19TRVRVUFxuXHRcdFx0XHRcdHRoaXMuRkxBR1MgfD0gSW1iYS5UQUdfU0VUVVBcblx0XHRcdFx0XHR0aGlzLnNldHVwXG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLmNvbW1pdFxuXG5cdFx0XHRcdHJldHVybiB0aGlzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0aWYgaGFzTW91bnRcblx0XHRcdFx0aWYgY3Rvci5AY2xhc3NlcyBhbmQgY3Rvci5AY2xhc3Nlcy5pbmRleE9mKCdfX21vdW50JykgID09IC0xXG5cdFx0XHRcdFx0Y3Rvci5AY2xhc3Nlcy5wdXNoKCdfX21vdW50JylcblxuXHRcdFx0XHRpZiBjdG9yLkBwcm90b0RvbVxuXHRcdFx0XHRcdGN0b3IuQHByb3RvRG9tOmNsYXNzTGlzdC5hZGQoJ19fbW91bnQnKVxuXG5cdFx0XHRmb3IgaXRlbSBpbiBbOm1vdXNlbW92ZSw6bW91c2VlbnRlciw6bW91c2VsZWF2ZSw6bW91c2VvdmVyLDptb3VzZW91dCw6c2VsZWN0c3RhcnRdXG5cdFx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKGl0ZW0pIGlmIHRoaXNbXCJvbntpdGVtfVwiXVxuXHRcdHNlbGZcblxuXG5cdGRlZiBpbml0aWFsaXplIGRvbSxjdHhcblx0XHRzZWxmLmRvbSA9IGRvbVxuXHRcdHNlbGY6JCA9IFRhZ0NhY2hlLmJ1aWxkKHNlbGYpXG5cdFx0c2VsZjokdXAgPSBAb3duZXJfID0gY3R4XG5cdFx0QHRyZWVfID0gbnVsbFxuXHRcdHNlbGYuRkxBR1MgPSAwXG5cdFx0YnVpbGRcblx0XHRzZWxmXG5cblx0YXR0ciBuYW1lIGlubGluZTogbm9cblx0YXR0ciByb2xlIGlubGluZTogbm9cblx0YXR0ciB0YWJpbmRleCBpbmxpbmU6IG5vXG5cdGF0dHIgdGl0bGVcblxuXHRkZWYgZG9tXG5cdFx0QGRvbVxuXHRcdFxuXHRkZWYgc2V0RG9tIGRvbVxuXHRcdGRvbS5AdGFnID0gc2VsZlxuXHRcdEBkb20gPSBkb21cblx0XHRzZWxmXG5cblx0ZGVmIHJlZlxuXHRcdEByZWZcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdCMjI1xuXHRTZXR0aW5nIHJlZmVyZW5jZXMgZm9yIHRhZ3MgbGlrZVxuXHRgPGRpdkBoZWFkZXI+YCB3aWxsIGNvbXBpbGUgdG8gYHRhZygnZGl2JykucmVmXygnaGVhZGVyJyx0aGlzKS5lbmQoKWBcblx0QnkgZGVmYXVsdCBpdCBhZGRzIHRoZSByZWZlcmVuY2UgYXMgYSBjbGFzc05hbWUgdG8gdGhlIHRhZy5cblxuXHRAcmV0dXJuIHtzZWxmfVxuXHRAcHJpdmF0ZVxuXHQjIyNcblx0ZGVmIHJlZl8gcmVmXG5cdFx0ZmxhZyhAcmVmID0gcmVmKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSBkYXRhIG9iamVjdCBmb3Igbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGRhdGE9IGRhdGFcblx0XHRAZGF0YSA9IGRhdGFcblxuXHQjIyNcblx0R2V0IHRoZSBkYXRhIG9iamVjdCBmb3Igbm9kZVxuXHQjIyNcblx0ZGVmIGRhdGFcblx0XHRAZGF0YVxuXHRcdFxuXHRcdFxuXHRkZWYgYmluZERhdGEgdGFyZ2V0LCBwYXRoLCBhcmdzXG5cdFx0c2V0RGF0YShhcmdzID8gdGFyZ2V0W3BhdGhdLmFwcGx5KHRhcmdldCxhcmdzKSA6IHRhcmdldFtwYXRoXSlcblxuXHQjIyNcblx0U2V0IGlubmVyIGh0bWwgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRpZiBzZWxmLmh0bWwgIT0gaHRtbFxuXHRcdFx0QGRvbTppbm5lckhUTUwgPSBodG1sXG5cblx0IyMjXG5cdEdldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sXG5cdFx0QGRvbTppbm5lckhUTUxcblx0XG5cdGRlZiBvbiQgc2xvdCxoYW5kbGVyLGNvbnRleHRcblx0XHRsZXQgaGFuZGxlcnMgPSBAb25fIHx8PSBbXVxuXHRcdGxldCBwcmV2ID0gaGFuZGxlcnNbc2xvdF1cblx0XHQjIHNlbGYtYm91bmQgaGFuZGxlcnNcblx0XHRpZiBzbG90IDwgMFxuXHRcdFx0aWYgcHJldiA9PSB1bmRlZmluZWRcblx0XHRcdFx0c2xvdCA9IGhhbmRsZXJzW3Nsb3RdID0gaGFuZGxlcnM6bGVuZ3RoXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHNsb3QgPSBwcmV2XG5cdFx0XHRwcmV2ID0gaGFuZGxlcnNbc2xvdF1cblx0XHRcblx0XHRoYW5kbGVyc1tzbG90XSA9IGhhbmRsZXJcblx0XHRpZiBwcmV2XG5cdFx0XHRoYW5kbGVyOnN0YXRlID0gcHJldjpzdGF0ZVxuXHRcdGVsc2Vcblx0XHRcdGhhbmRsZXI6c3RhdGUgPSB7Y29udGV4dDogY29udGV4dH1cblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0ZGVmIGlkPSBpZFxuXHRcdGlmIGlkICE9IG51bGxcblx0XHRcdGRvbTppZCA9IGlkXG5cblx0ZGVmIGlkXG5cdFx0ZG9tOmlkXG5cblx0IyMjXG5cdEFkZHMgYSBuZXcgYXR0cmlidXRlIG9yIGNoYW5nZXMgdGhlIHZhbHVlIG9mIGFuIGV4aXN0aW5nIGF0dHJpYnV0ZVxuXHRvbiB0aGUgc3BlY2lmaWVkIHRhZy4gSWYgdGhlIHZhbHVlIGlzIG51bGwgb3IgZmFsc2UsIHRoZSBhdHRyaWJ1dGVcblx0d2lsbCBiZSByZW1vdmVkLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldEF0dHJpYnV0ZSBuYW1lLCB2YWx1ZVxuXHRcdHZhciBvbGQgPSBkb20uZ2V0QXR0cmlidXRlKG5hbWUpXG5cblx0XHRpZiBvbGQgPT0gdmFsdWVcblx0XHRcdHZhbHVlXG5cdFx0ZWxpZiB2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBmYWxzZVxuXHRcdFx0ZG9tLnNldEF0dHJpYnV0ZShuYW1lLHZhbHVlKVxuXHRcdGVsc2Vcblx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUobmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBzZXROZXN0ZWRBdHRyIG5zLCBuYW1lLCB2YWx1ZVxuXHRcdGlmIHNlbGZbbnMrJ1NldEF0dHJpYnV0ZSddXG5cdFx0XHRzZWxmW25zKydTZXRBdHRyaWJ1dGUnXShuYW1lLHZhbHVlKVxuXHRcdGVsc2Vcblx0XHRcdHNldEF0dHJpYnV0ZU5TKG5zLCBuYW1lLHZhbHVlKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHNldEF0dHJpYnV0ZU5TIG5zLCBuYW1lLCB2YWx1ZVxuXHRcdHZhciBvbGQgPSBnZXRBdHRyaWJ1dGVOUyhucyxuYW1lKVxuXG5cdFx0aWYgb2xkICE9IHZhbHVlXG5cdFx0XHRpZiB2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBmYWxzZSBcblx0XHRcdFx0ZG9tLnNldEF0dHJpYnV0ZU5TKG5zLG5hbWUsdmFsdWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGVOUyhucyxuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblxuXHQjIyNcblx0cmVtb3ZlcyBhbiBhdHRyaWJ1dGUgZnJvbSB0aGUgc3BlY2lmaWVkIHRhZ1xuXHQjIyNcblx0ZGVmIHJlbW92ZUF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXG5cdCMjI1xuXHRyZXR1cm5zIHRoZSB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUgb24gdGhlIHRhZy5cblx0SWYgdGhlIGdpdmVuIGF0dHJpYnV0ZSBkb2VzIG5vdCBleGlzdCwgdGhlIHZhbHVlIHJldHVybmVkXG5cdHdpbGwgZWl0aGVyIGJlIG51bGwgb3IgXCJcIiAodGhlIGVtcHR5IHN0cmluZylcblx0IyMjXG5cdGRlZiBnZXRBdHRyaWJ1dGUgbmFtZVxuXHRcdGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXG5cdGRlZiBnZXRBdHRyaWJ1dGVOUyBucywgbmFtZVxuXHRcdGRvbS5nZXRBdHRyaWJ1dGVOUyhucyxuYW1lKVxuXHRcblx0XG5cdGRlZiBzZXQga2V5LCB2YWx1ZSwgbW9kc1xuXHRcdGxldCBzZXR0ZXIgPSBJbWJhLnRvU2V0dGVyKGtleSlcblx0XHRpZiBzZWxmW3NldHRlcl0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRzZWxmW3NldHRlcl0odmFsdWUsbW9kcylcblx0XHRlbHNlXG5cdFx0XHRAZG9tOnNldEF0dHJpYnV0ZShrZXksdmFsdWUpXG5cdFx0c2VsZlxuXHRcblx0XG5cdGRlZiBnZXQga2V5XG5cdFx0QGRvbTpnZXRBdHRyaWJ1dGUoa2V5KVxuXG5cdCMjI1xuXHRPdmVycmlkZSB0aGlzIHRvIHByb3ZpZGUgc3BlY2lhbCB3cmFwcGluZyBldGMuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0Q29udGVudCBjb250ZW50LCB0eXBlXG5cdFx0c2V0Q2hpbGRyZW4gY29udGVudCwgdHlwZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSBjaGlsZHJlbiBvZiBub2RlLiB0eXBlIHBhcmFtIGlzIG9wdGlvbmFsLFxuXHRhbmQgc2hvdWxkIG9ubHkgYmUgdXNlZCBieSBJbWJhIHdoZW4gY29tcGlsaW5nIHRhZyB0cmVlcy4gXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0Q2hpbGRyZW4gbm9kZXMsIHR5cGVcblx0XHQjIG92ZXJyaWRkZW4gb24gY2xpZW50IGJ5IHJlY29uY2lsZXJcblx0XHRAdHJlZV8gPSBub2Rlc1xuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSB0ZW1wbGF0ZSB0aGF0IHdpbGwgcmVuZGVyIHRoZSBjb250ZW50IG9mIG5vZGUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0VGVtcGxhdGUgdGVtcGxhdGVcblx0XHR1bmxlc3MgQHRlbXBsYXRlXG5cdFx0XHQjIG92ZXJyaWRlIHRoZSBiYXNpY1xuXHRcdFx0aWYgc2VsZjpyZW5kZXIgPT0gSW1iYS5UYWc6cHJvdG90eXBlOnJlbmRlclxuXHRcdFx0XHRzZWxmOnJlbmRlciA9IHNlbGY6cmVuZGVyVGVtcGxhdGUgIyBkbyBzZXRDaGlsZHJlbihyZW5kZXJUZW1wbGF0ZSlcblx0XHRcdHNlbGYub3B0aW1pemVUYWdTdHJ1Y3R1cmVcblxuXHRcdHNlbGY6dGVtcGxhdGUgPSBAdGVtcGxhdGUgPSB0ZW1wbGF0ZVxuXHRcdHNlbGZcblxuXHRkZWYgdGVtcGxhdGVcblx0XHRudWxsXG5cblx0IyMjXG5cdElmIG5vIGN1c3RvbSByZW5kZXItbWV0aG9kIGlzIGRlZmluZWQsIGFuZCB0aGUgbm9kZVxuXHRoYXMgYSB0ZW1wbGF0ZSwgdGhpcyBtZXRob2Qgd2lsbCBiZSB1c2VkIHRvIHJlbmRlclxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbmRlclRlbXBsYXRlXG5cdFx0dmFyIGJvZHkgPSB0ZW1wbGF0ZVxuXHRcdHNldENoaWxkcmVuKGJvZHkpIGlmIGJvZHkgIT0gc2VsZlxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRSZW1vdmUgc3BlY2lmaWVkIGNoaWxkIGZyb20gY3VycmVudCBub2RlLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbW92ZUNoaWxkIGNoaWxkXG5cdFx0dmFyIHBhciA9IGRvbVxuXHRcdHZhciBlbCA9IGNoaWxkLkBkb20gb3IgY2hpbGRcblx0XHRpZiBlbCBhbmQgZWw6cGFyZW50Tm9kZSA9PSBwYXJcblx0XHRcdHBhci5yZW1vdmVDaGlsZChlbClcblx0XHRcdEltYmEuVGFnTWFuYWdlci5yZW1vdmUoZWwuQHRhZyBvciBlbCxzZWxmKVxuXHRcdHNlbGZcblx0XG5cdCMjI1xuXHRSZW1vdmUgYWxsIGNvbnRlbnQgaW5zaWRlIG5vZGVcblx0IyMjXG5cdGRlZiByZW1vdmVBbGxDaGlsZHJlblxuXHRcdGlmIEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0QGRvbS5yZW1vdmVDaGlsZChAZG9tOmZpcnN0Q2hpbGQpIHdoaWxlIEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlbW92ZShudWxsLHNlbGYpICMgc2hvdWxkIHJlZ2lzdGVyIGVhY2ggY2hpbGQ/XG5cdFx0QHRyZWVfID0gQHRleHRfID0gbnVsbFxuXHRcdHNlbGZcblxuXHQjIyNcblx0QXBwZW5kIGEgc2luZ2xlIGl0ZW0gKG5vZGUgb3Igc3RyaW5nKSB0byB0aGUgY3VycmVudCBub2RlLlxuXHRJZiBzdXBwbGllZCBpdGVtIGlzIGEgc3RyaW5nIGl0IHdpbGwgYXV0b21hdGljYWxseS4gVGhpcyBpcyB1c2VkXG5cdGJ5IEltYmEgaW50ZXJuYWxseSwgYnV0IHdpbGwgcHJhY3RpY2FsbHkgbmV2ZXIgYmUgdXNlZCBleHBsaWNpdGx5LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGFwcGVuZENoaWxkIG5vZGVcblx0XHRpZiBub2RlIGlzYSBTdHJpbmdcblx0XHRcdGRvbS5hcHBlbmRDaGlsZChJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpKVxuXHRcdGVsaWYgbm9kZVxuXHRcdFx0ZG9tLmFwcGVuZENoaWxkKG5vZGUuQGRvbSBvciBub2RlKVxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLmluc2VydChub2RlLkB0YWcgb3Igbm9kZSwgc2VsZilcblx0XHRcdCMgRklYTUUgZW5zdXJlIHRoZXNlIGFyZSBub3QgY2FsbGVkIGZvciB0ZXh0IG5vZGVzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRJbnNlcnQgYSBub2RlIGludG8gdGhlIGN1cnJlbnQgbm9kZSAoc2VsZiksIGJlZm9yZSBhbm90aGVyLlxuXHRUaGUgcmVsYXRpdmUgbm9kZSBtdXN0IGJlIGEgY2hpbGQgb2YgY3VycmVudCBub2RlLiBcblx0IyMjXG5cdGRlZiBpbnNlcnRCZWZvcmUgbm9kZSwgcmVsXG5cdFx0aWYgbm9kZSBpc2EgU3RyaW5nXG5cdFx0XHRub2RlID0gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdFx0aWYgbm9kZSBhbmQgcmVsXG5cdFx0XHRkb20uaW5zZXJ0QmVmb3JlKCAobm9kZS5AZG9tIG9yIG5vZGUpLCAocmVsLkBkb20gb3IgcmVsKSApXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUuQHRhZyBvciBub2RlLCBzZWxmKVxuXHRcdFx0IyBGSVhNRSBlbnN1cmUgdGhlc2UgYXJlIG5vdCBjYWxsZWQgZm9yIHRleHQgbm9kZXNcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0UmVtb3ZlIG5vZGUgZnJvbSB0aGUgZG9tIHRyZWVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBvcnBoYW5pemVcblx0XHRwYXIucmVtb3ZlQ2hpbGQoc2VsZikgaWYgbGV0IHBhciA9IHBhcmVudFxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdEdldCB0ZXh0IG9mIG5vZGUuIFVzZXMgdGV4dENvbnRlbnQgYmVoaW5kIHRoZSBzY2VuZXMgKG5vdCBpbm5lclRleHQpXG5cdFtodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm9kZS90ZXh0Q29udGVudF0oKVxuXHRAcmV0dXJuIHtzdHJpbmd9IGlubmVyIHRleHQgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIHRleHQgdlxuXHRcdEBkb206dGV4dENvbnRlbnRcblxuXHQjIyNcblx0U2V0IHRleHQgb2Ygbm9kZS4gVXNlcyB0ZXh0Q29udGVudCBiZWhpbmQgdGhlIHNjZW5lcyAobm90IGlubmVyVGV4dClcblx0W2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XSgpXG5cdCMjI1xuXHRkZWYgdGV4dD0gdHh0XG5cdFx0QHRyZWVfID0gdHh0XG5cdFx0QGRvbTp0ZXh0Q29udGVudCA9ICh0eHQgPT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSkgPyAnJyA6IHR4dFxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRNZXRob2QgZm9yIGdldHRpbmcgYW5kIHNldHRpbmcgZGF0YS1hdHRyaWJ1dGVzLiBXaGVuIGNhbGxlZCB3aXRoIHplcm9cblx0YXJndW1lbnRzIGl0IHdpbGwgcmV0dXJuIHRoZSBhY3R1YWwgZGF0YXNldCBmb3IgdGhlIHRhZy5cblxuXHRcdHZhciBub2RlID0gPGRpdiBkYXRhLW5hbWU9J2hlbGxvJz5cblx0XHQjIGdldCB0aGUgd2hvbGUgZGF0YXNldFxuXHRcdG5vZGUuZGF0YXNldCAjIHtuYW1lOiAnaGVsbG8nfVxuXHRcdCMgZ2V0IGEgc2luZ2xlIHZhbHVlXG5cdFx0bm9kZS5kYXRhc2V0KCduYW1lJykgIyAnaGVsbG8nXG5cdFx0IyBzZXQgYSBzaW5nbGUgdmFsdWVcblx0XHRub2RlLmRhdGFzZXQoJ25hbWUnLCduZXduYW1lJykgIyBzZWxmXG5cblxuXHQjIyNcblx0ZGVmIGRhdGFzZXQga2V5LCB2YWxcblx0XHRpZiBrZXkgaXNhIE9iamVjdFxuXHRcdFx0ZGF0YXNldChrLHYpIGZvciBvd24gayx2IG9mIGtleVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMlxuXHRcdFx0c2V0QXR0cmlidXRlKFwiZGF0YS17a2V5fVwiLHZhbClcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiBrZXlcblx0XHRcdHJldHVybiBnZXRBdHRyaWJ1dGUoXCJkYXRhLXtrZXl9XCIpXG5cblx0XHR2YXIgZGF0YXNldCA9IGRvbTpkYXRhc2V0XG5cblx0XHR1bmxlc3MgZGF0YXNldFxuXHRcdFx0ZGF0YXNldCA9IHt9XG5cdFx0XHRmb3IgYXRyLGkgaW4gZG9tOmF0dHJpYnV0ZXNcblx0XHRcdFx0aWYgYXRyOm5hbWUuc3Vic3RyKDAsNSkgPT0gJ2RhdGEtJ1xuXHRcdFx0XHRcdGRhdGFzZXRbSW1iYS50b0NhbWVsQ2FzZShhdHI6bmFtZS5zbGljZSg1KSldID0gYXRyOnZhbHVlXG5cblx0XHRyZXR1cm4gZGF0YXNldFxuXG5cdCMjI1xuXHRFbXB0eSBwbGFjZWhvbGRlci4gT3ZlcnJpZGUgdG8gaW1wbGVtZW50IGN1c3RvbSByZW5kZXIgYmVoYXZpb3VyLlxuXHRXb3JrcyBtdWNoIGxpa2UgdGhlIGZhbWlsaWFyIHJlbmRlci1tZXRob2QgaW4gUmVhY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB3aGlsZSB0YWcgaXMgaW5pdGlhbGl6aW5nLiBObyBpbml0aWFsIHByb3BzXG5cdHdpbGwgaGF2ZSBiZWVuIHNldCBhdCB0aGlzIHBvaW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGJ1aWxkXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgb25jZSwgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZC4gQWxsIGluaXRpYWwgcHJvcHNcblx0YW5kIGNoaWxkcmVuIHdpbGwgaGF2ZSBiZWVuIHNldCBiZWZvcmUgc2V0dXAgaXMgY2FsbGVkLlxuXHRzZXRDb250ZW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldHVwXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZCwgZm9yIHRhZ3MgdGhhdCBhcmUgcGFydCBvZlxuXHRhIHRhZyB0cmVlICh0aGF0IGFyZSByZW5kZXJlZCBzZXZlcmFsIHRpbWVzKS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjb21taXRcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q2FsbGVkIGJ5IHRoZSB0YWctc2NoZWR1bGVyIChpZiB0aGlzIHRhZyBpcyBzY2hlZHVsZWQpXG5cdEJ5IGRlZmF1bHQgaXQgd2lsbCBjYWxsIHRoaXMucmVuZGVyLiBEbyBub3Qgb3ZlcnJpZGUgdW5sZXNzXG5cdHlvdSByZWFsbHkgdW5kZXJzdGFuZCBpdC5cblxuXHQjIyNcblx0ZGVmIHRpY2tcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cdFxuXHRBIHZlcnkgaW1wb3J0YW50IG1ldGhvZCB0aGF0IHlvdSB3aWxsIHByYWN0aWNhbGx5IG5ldmVyIG1hbnVhbGx5LlxuXHRUaGUgdGFnIHN5bnRheCBvZiBJbWJhIGNvbXBpbGVzIHRvIGEgY2hhaW4gb2Ygc2V0dGVycywgd2hpY2ggYWx3YXlzXG5cdGVuZHMgd2l0aCAuZW5kLiBgPGEubGFyZ2U+YCBjb21waWxlcyB0byBgdGFnKCdhJykuZmxhZygnbGFyZ2UnKS5lbmQoKWBcblx0XG5cdFlvdSBhcmUgaGlnaGx5IGFkdmljZWQgdG8gbm90IG92ZXJyaWRlIGl0cyBiZWhhdmlvdXIuIFRoZSBmaXJzdCB0aW1lXG5cdGVuZCBpcyBjYWxsZWQgaXQgd2lsbCBtYXJrIHRoZSB0YWcgYXMgaW5pdGlhbGl6ZWQgYW5kIGNhbGwgSW1iYS5UYWcjc2V0dXAsXG5cdGFuZCBjYWxsIEltYmEuVGFnI2NvbW1pdCBldmVyeSB0aW1lLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGVuZFxuXHRcdHNlbGZcblx0XHRcblx0IyBjYWxsZWQgb24gPHNlbGY+IHRvIGNoZWNrIGlmIHNlbGYgaXMgY2FsbGVkIGZyb20gb3RoZXIgcGxhY2VzXG5cdGRlZiAkb3BlbiBjb250ZXh0XG5cdFx0aWYgY29udGV4dCAhPSBAY29udGV4dF9cblx0XHRcdEB0cmVlXyA9IG51bGxcblx0XHRcdEBjb250ZXh0XyA9IGNvbnRleHRcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRoaXMgaXMgY2FsbGVkIGluc3RlYWQgb2YgSW1iYS5UYWcjZW5kIGZvciBgPHNlbGY+YCB0YWcgY2hhaW5zLlxuXHREZWZhdWx0cyB0byBub29wXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc3luY2VkXG5cdFx0c2VsZlxuXG5cdCMgY2FsbGVkIHdoZW4gdGhlIG5vZGUgaXMgYXdha2VuZWQgaW4gdGhlIGRvbSAtIGVpdGhlciBhdXRvbWF0aWNhbGx5XG5cdCMgdXBvbiBhdHRhY2htZW50IHRvIHRoZSBkb20tdHJlZSwgb3IgdGhlIGZpcnN0IHRpbWUgaW1iYSBuZWVkcyB0aGVcblx0IyB0YWcgZm9yIGEgZG9tbm9kZSB0aGF0IGhhcyBiZWVuIHJlbmRlcmVkIG9uIHRoZSBzZXJ2ZXJcblx0ZGVmIGF3YWtlblxuXHRcdHNlbGZcblxuXHQjIyNcblx0TGlzdCBvZiBmbGFncyBmb3IgdGhpcyBub2RlLiBcblx0IyMjXG5cdGRlZiBmbGFnc1xuXHRcdEBkb206Y2xhc3NMaXN0XG5cblx0IyMjXG5cdEFkZCBzcGVmaWNpZWQgZmxhZyB0byBjdXJyZW50IG5vZGUuXG5cdElmIGEgc2Vjb25kIGFyZ3VtZW50IGlzIHN1cHBsaWVkLCBpdCB3aWxsIGJlIGNvZXJjZWQgaW50byBhIEJvb2xlYW4sXG5cdGFuZCB1c2VkIHRvIGluZGljYXRlIHdoZXRoZXIgd2Ugc2hvdWxkIHJlbW92ZSB0aGUgZmxhZyBpbnN0ZWFkLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZsYWcgbmFtZSwgdG9nZ2xlclxuXHRcdCMgaXQgaXMgbW9zdCBuYXR1cmFsIHRvIHRyZWF0IGEgc2Vjb25kIHVuZGVmaW5lZCBhcmd1bWVudCBhcyBhIG5vLXN3aXRjaFxuXHRcdCMgc28gd2UgbmVlZCB0byBjaGVjayB0aGUgYXJndW1lbnRzLWxlbmd0aFxuXHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMlxuXHRcdFx0aWYgQGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSkgIT0gISF0b2dnbGVyXG5cdFx0XHRcdEBkb206Y2xhc3NMaXN0LnRvZ2dsZShuYW1lKVxuXHRcdGVsc2Vcblx0XHRcdCMgZmlyZWZveCB3aWxsIHRyaWdnZXIgYSBjaGFuZ2UgaWYgYWRkaW5nIGV4aXN0aW5nIGNsYXNzXG5cdFx0XHRAZG9tOmNsYXNzTGlzdC5hZGQobmFtZSkgdW5sZXNzIEBkb206Y2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0UmVtb3ZlIHNwZWNpZmllZCBmbGFnIGZyb20gbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHVuZmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QucmVtb3ZlKG5hbWUpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRUb2dnbGUgc3BlY2lmaWVkIGZsYWcgb24gbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHRvZ2dsZUZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LnRvZ2dsZShuYW1lKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2hlY2sgd2hldGhlciBjdXJyZW50IG5vZGUgaGFzIHNwZWNpZmllZCBmbGFnXG5cdEByZXR1cm4ge2Jvb2x9XG5cdCMjI1xuXHRkZWYgaGFzRmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSlcblxuXHRcblx0ZGVmIGZsYWdJZiBmbGFnLCBib29sXG5cdFx0dmFyIGYgPSBAZmxhZ3NfIHx8PSB7fVxuXHRcdGxldCBwcmV2ID0gZltmbGFnXVxuXG5cdFx0aWYgYm9vbCBhbmQgIXByZXZcblx0XHRcdEBkb206Y2xhc3NMaXN0LmFkZChmbGFnKVxuXHRcdFx0ZltmbGFnXSA9IHllc1xuXHRcdGVsaWYgcHJldiBhbmQgIWJvb2xcblx0XHRcdEBkb206Y2xhc3NMaXN0LnJlbW92ZShmbGFnKVxuXHRcdFx0ZltmbGFnXSA9IG5vXG5cblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHQjIyNcblx0U2V0L3VwZGF0ZSBhIG5hbWVkIGZsYWcuIEl0IHJlbWVtYmVycyB0aGUgcHJldmlvdXNcblx0dmFsdWUgb2YgdGhlIGZsYWcsIGFuZCByZW1vdmVzIGl0IGJlZm9yZSBzZXR0aW5nIHRoZSBuZXcgdmFsdWUuXG5cblx0XHRub2RlLnNldEZsYWcoJ3R5cGUnLCd0b2RvJylcblx0XHRub2RlLnNldEZsYWcoJ3R5cGUnLCdwcm9qZWN0Jylcblx0XHQjIHRvZG8gaXMgcmVtb3ZlZCwgcHJvamVjdCBpcyBhZGRlZC5cblxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldEZsYWcgbmFtZSwgdmFsdWVcblx0XHRsZXQgZmxhZ3MgPSBAbmFtZWRGbGFnc18gfHw9IHt9XG5cdFx0bGV0IHByZXYgPSBmbGFnc1tuYW1lXVxuXHRcdGlmIHByZXYgIT0gdmFsdWVcblx0XHRcdHVuZmxhZyhwcmV2KSBpZiBwcmV2XG5cdFx0XHRmbGFnKHZhbHVlKSBpZiB2YWx1ZVxuXHRcdFx0ZmxhZ3NbbmFtZV0gPSB2YWx1ZVxuXHRcdHJldHVybiBzZWxmXG5cblxuXHQjIyNcblx0R2V0IHRoZSBzY2hlZHVsZXIgZm9yIHRoaXMgbm9kZS4gQSBuZXcgc2NoZWR1bGVyIHdpbGwgYmUgY3JlYXRlZFxuXHRpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuXG5cdEByZXR1cm4ge0ltYmEuU2NoZWR1bGVyfVxuXHQjIyNcblx0ZGVmIHNjaGVkdWxlclxuXHRcdEBzY2hlZHVsZXIgPz0gSW1iYS5TY2hlZHVsZXIubmV3KHNlbGYpXG5cblx0IyMjXG5cblx0U2hvcnRoYW5kIHRvIHN0YXJ0IHNjaGVkdWxpbmcgYSBub2RlLiBUaGUgbWV0aG9kIHdpbGwgYmFzaWNhbGx5XG5cdHByb3h5IHRoZSBhcmd1bWVudHMgdGhyb3VnaCB0byBzY2hlZHVsZXIuY29uZmlndXJlLCBhbmQgdGhlblxuXHRhY3RpdmF0ZSB0aGUgc2NoZWR1bGVyLlxuXHRcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzY2hlZHVsZSBvcHRpb25zID0ge2V2ZW50czogeWVzfVxuXHRcdHNjaGVkdWxlci5jb25maWd1cmUob3B0aW9ucykuYWN0aXZhdGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNob3J0aGFuZCBmb3IgZGVhY3RpdmF0aW5nIHNjaGVkdWxlciAoaWYgdGFnIGhhcyBvbmUpLlxuXHRAZGVwcmVjYXRlZFxuXHQjIyNcblx0ZGVmIHVuc2NoZWR1bGVcblx0XHRzY2hlZHVsZXIuZGVhY3RpdmF0ZSBpZiBAc2NoZWR1bGVyXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdEdldCB0aGUgcGFyZW50IG9mIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtJbWJhLlRhZ30gXG5cdCMjI1xuXHRkZWYgcGFyZW50XG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oZG9tOnBhcmVudE5vZGUpXG5cblx0IyMjXG5cdEdldCB0aGUgY2hpbGRyZW4gb2Ygbm9kZVxuXHRAcmV0dXJuIHtJbWJhLlRhZ1tdfVxuXHQjIyNcblx0ZGVmIGNoaWxkcmVuIHNlbFxuXHRcdGZvciBpdGVtIGluIEBkb206Y2hpbGRyZW5cblx0XHRcdGl0ZW0uQHRhZyBvciBJbWJhLmdldFRhZ0ZvckRvbShpdGVtKVxuXHRcblx0ZGVmIHF1ZXJ5U2VsZWN0b3IgcVxuXHRcdEltYmEuZ2V0VGFnRm9yRG9tKEBkb20ucXVlcnlTZWxlY3RvcihxKSlcblxuXHRkZWYgcXVlcnlTZWxlY3RvckFsbCBxXG5cdFx0dmFyIGl0ZW1zID0gW11cblx0XHRmb3IgaXRlbSBpbiBAZG9tLnF1ZXJ5U2VsZWN0b3JBbGwocSlcblx0XHRcdGl0ZW1zLnB1c2goIEltYmEuZ2V0VGFnRm9yRG9tKGl0ZW0pIClcblx0XHRyZXR1cm4gaXRlbXNcblxuXHQjIyNcblx0Q2hlY2sgaWYgdGhpcyBub2RlIG1hdGNoZXMgYSBzZWxlY3RvclxuXHRAcmV0dXJuIHtCb29sZWFufVxuXHQjIyNcblx0ZGVmIG1hdGNoZXMgc2VsXG5cdFx0aWYgc2VsIGlzYSBGdW5jdGlvblxuXHRcdFx0cmV0dXJuIHNlbChzZWxmKVxuXG5cdFx0c2VsID0gc2VsLnF1ZXJ5IGlmIHNlbDpxdWVyeSBpc2EgRnVuY3Rpb25cblx0XHRpZiB2YXIgZm4gPSAoQGRvbTptYXRjaGVzIG9yIEBkb206bWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206d2Via2l0TWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206bXNNYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTptb3pNYXRjaGVzU2VsZWN0b3IpXG5cdFx0XHRyZXR1cm4gZm4uY2FsbChAZG9tLHNlbClcblxuXHQjIyNcblx0R2V0IHRoZSBmaXJzdCBlbGVtZW50IG1hdGNoaW5nIHN1cHBsaWVkIHNlbGVjdG9yIC8gZmlsdGVyXG5cdHRyYXZlcnNpbmcgdXB3YXJkcywgYnV0IGluY2x1ZGluZyB0aGUgbm9kZSBpdHNlbGYuXG5cdEByZXR1cm4ge0ltYmEuVGFnfVxuXHQjIyNcblx0ZGVmIGNsb3Nlc3Qgc2VsXG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oQGRvbS5jbG9zZXN0KHNlbCkpXG5cblx0IyMjXG5cdENoZWNrIGlmIG5vZGUgY29udGFpbnMgb3RoZXIgbm9kZVxuXHRAcmV0dXJuIHtCb29sZWFufSBcblx0IyMjXG5cdGRlZiBjb250YWlucyBub2RlXG5cdFx0ZG9tLmNvbnRhaW5zKG5vZGUuQGRvbSBvciBub2RlKVxuXG5cblx0IyMjXG5cdFNob3J0aGFuZCBmb3IgY29uc29sZS5sb2cgb24gZWxlbWVudHNcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBsb2cgKmFyZ3Ncblx0XHRhcmdzLnVuc2hpZnQoY29uc29sZSlcblx0XHRGdW5jdGlvbjpwcm90b3R5cGU6Y2FsbC5hcHBseShjb25zb2xlOmxvZywgYXJncylcblx0XHRzZWxmXG5cblx0ZGVmIGNzcyBrZXksIHZhbFxuXHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRjc3Moayx2KSBmb3Igb3duIGssdiBvZiBrZXlcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHR2YXIgbmFtZSA9IEltYmEuQ1NTS2V5TWFwW2tleV0gb3Iga2V5XG5cblx0XHRpZiB2YWwgPT0gbnVsbFxuXHRcdFx0ZG9tOnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpXG5cdFx0ZWxpZiB2YWwgPT0gdW5kZWZpbmVkIGFuZCBhcmd1bWVudHM6bGVuZ3RoID09IDFcblx0XHRcdHJldHVybiBkb206c3R5bGVbbmFtZV1cblx0XHRlbHNlXG5cdFx0XHRpZiB2YWwgaXNhIE51bWJlciBhbmQgbmFtZS5tYXRjaCgvd2lkdGh8aGVpZ2h0fGxlZnR8cmlnaHR8dG9wfGJvdHRvbS8pXG5cdFx0XHRcdGRvbTpzdHlsZVtuYW1lXSA9IHZhbCArIFwicHhcIlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb206c3R5bGVbbmFtZV0gPSB2YWxcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBzZXRTdHlsZSBzdHlsZVxuXHRcdHNldEF0dHJpYnV0ZSgnc3R5bGUnLHN0eWxlKVxuXG5cdGRlZiBzdHlsZVxuXHRcdGdldEF0dHJpYnV0ZSgnc3R5bGUnKVxuXG5cdCMjI1xuXHRUcmlnZ2VyIGFuIGV2ZW50IGZyb20gY3VycmVudCBub2RlLiBEaXNwYXRjaGVkIHRocm91Z2ggdGhlIEltYmEgZXZlbnQgbWFuYWdlci5cblx0VG8gZGlzcGF0Y2ggYWN0dWFsIGRvbSBldmVudHMsIHVzZSBkb20uZGlzcGF0Y2hFdmVudCBpbnN0ZWFkLlxuXG5cdEByZXR1cm4ge0ltYmEuRXZlbnR9XG5cdCMjI1xuXHRkZWYgdHJpZ2dlciBuYW1lLCBkYXRhID0ge31cblx0XHQkd2ViJCA/IEltYmEuRXZlbnRzLnRyaWdnZXIobmFtZSxzZWxmLGRhdGE6IGRhdGEpIDogbnVsbFxuXG5cdCMjI1xuXHRGb2N1cyBvbiBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmb2N1c1xuXHRcdGRvbS5mb2N1c1xuXHRcdHNlbGZcblxuXHQjIyNcblx0UmVtb3ZlIGZvY3VzIGZyb20gY3VycmVudCBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYmx1clxuXHRcdGRvbS5ibHVyXG5cdFx0c2VsZlxuXG5cdGRlZiB0b1N0cmluZ1xuXHRcdGRvbTpvdXRlckhUTUxcblx0XG5cbkltYmEuVGFnOnByb3RvdHlwZTppbml0aWFsaXplID0gSW1iYS5UYWdcblxuY2xhc3MgSW1iYS5TVkdUYWcgPCBJbWJhLlRhZ1xuXG5cdGRlZiBzZWxmLm5hbWVzcGFjZVVSSVxuXHRcdFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuXG5cdGRlZiBzZWxmLmJ1aWxkTm9kZVxuXHRcdHZhciBkb20gPSBJbWJhLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksQG5vZGVUeXBlKVxuXHRcdHZhciBjbHMgPSBAY2xhc3Nlcy5qb2luKFwiIFwiKVxuXHRcdGRvbTpjbGFzc05hbWU6YmFzZVZhbCA9IGNscyBpZiBjbHNcblx0XHRkb21cblxuXHRkZWYgc2VsZi5pbmhlcml0IGNoaWxkXG5cdFx0Y2hpbGQuQHByb3RvRG9tID0gbnVsbFxuXHRcdGlmIGNoaWxkLkBuYW1lIGluIEltYmEuU1ZHX1RBR1Ncblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IGNoaWxkLkBuYW1lXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IFtdXG5cdFx0ZWxzZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gQG5vZGVUeXBlXG5cdFx0XHR2YXIgY2xhc3NOYW1lID0gXCJfXCIgKyBjaGlsZC5AbmFtZS5yZXBsYWNlKC9fL2csICctJylcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gQGNsYXNzZXMuY29uY2F0KGNsYXNzTmFtZSlcblxuSW1iYS5IVE1MX1RBR1MgPSBcImEgYWJiciBhZGRyZXNzIGFyZWEgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiIGJhc2UgYmRpIGJkbyBiaWcgYmxvY2txdW90ZSBib2R5IGJyIGJ1dHRvbiBjYW52YXMgY2FwdGlvbiBjaXRlIGNvZGUgY29sIGNvbGdyb3VwIGRhdGEgZGF0YWxpc3QgZGQgZGVsIGRldGFpbHMgZGZuIGRpdiBkbCBkdCBlbSBlbWJlZCBmaWVsZHNldCBmaWdjYXB0aW9uIGZpZ3VyZSBmb290ZXIgZm9ybSBoMSBoMiBoMyBoNCBoNSBoNiBoZWFkIGhlYWRlciBociBodG1sIGkgaWZyYW1lIGltZyBpbnB1dCBpbnMga2JkIGtleWdlbiBsYWJlbCBsZWdlbmQgbGkgbGluayBtYWluIG1hcCBtYXJrIG1lbnUgbWVudWl0ZW0gbWV0YSBtZXRlciBuYXYgbm9zY3JpcHQgb2JqZWN0IG9sIG9wdGdyb3VwIG9wdGlvbiBvdXRwdXQgcCBwYXJhbSBwcmUgcHJvZ3Jlc3MgcSBycCBydCBydWJ5IHMgc2FtcCBzY3JpcHQgc2VjdGlvbiBzZWxlY3Qgc21hbGwgc291cmNlIHNwYW4gc3Ryb25nIHN0eWxlIHN1YiBzdW1tYXJ5IHN1cCB0YWJsZSB0Ym9keSB0ZCB0ZXh0YXJlYSB0Zm9vdCB0aCB0aGVhZCB0aW1lIHRpdGxlIHRyIHRyYWNrIHUgdWwgdmFyIHZpZGVvIHdiclwiLnNwbGl0KFwiIFwiKVxuSW1iYS5IVE1MX1RBR1NfVU5TQUZFID0gXCJhcnRpY2xlIGFzaWRlIGhlYWRlciBzZWN0aW9uXCIuc3BsaXQoXCIgXCIpXG5JbWJhLlNWR19UQUdTID0gXCJjaXJjbGUgZGVmcyBlbGxpcHNlIGcgbGluZSBsaW5lYXJHcmFkaWVudCBtYXNrIHBhdGggcGF0dGVybiBwb2x5Z29uIHBvbHlsaW5lIHJhZGlhbEdyYWRpZW50IHJlY3Qgc3RvcCBzdmcgdGV4dCB0c3BhblwiLnNwbGl0KFwiIFwiKVxuXG5JbWJhLkhUTUxfQVRUUlMgPVxuXHRhOiBcImhyZWYgdGFyZ2V0IGhyZWZsYW5nIG1lZGlhIGRvd25sb2FkIHJlbCB0eXBlXCJcblx0Zm9ybTogXCJtZXRob2QgYWN0aW9uIGVuY3R5cGUgYXV0b2NvbXBsZXRlIHRhcmdldFwiXG5cdGJ1dHRvbjogXCJhdXRvZm9jdXMgdHlwZVwiXG5cdGlucHV0OiBcImFjY2VwdCBkaXNhYmxlZCBmb3JtIGxpc3QgbWF4IG1heGxlbmd0aCBtaW4gcGF0dGVybiByZXF1aXJlZCBzaXplIHN0ZXAgdHlwZVwiXG5cdGxhYmVsOiBcImFjY2Vzc2tleSBmb3IgZm9ybVwiXG5cdGltZzogXCJzcmMgc3Jjc2V0XCJcblx0bGluazogXCJyZWwgdHlwZSBocmVmIG1lZGlhXCJcblx0aWZyYW1lOiBcInJlZmVycmVycG9saWN5IHNyYyBzcmNkb2Mgc2FuZGJveFwiXG5cdG1ldGE6IFwicHJvcGVydHkgY29udGVudCBjaGFyc2V0IGRlc2NcIlxuXHRvcHRncm91cDogXCJsYWJlbFwiXG5cdG9wdGlvbjogXCJsYWJlbFwiXG5cdG91dHB1dDogXCJmb3IgZm9ybVwiXG5cdG9iamVjdDogXCJ0eXBlIGRhdGEgd2lkdGggaGVpZ2h0XCJcblx0cGFyYW06IFwibmFtZSB2YWx1ZVwiXG5cdHByb2dyZXNzOiBcIm1heFwiXG5cdHNjcmlwdDogXCJzcmMgdHlwZSBhc3luYyBkZWZlciBjcm9zc29yaWdpbiBpbnRlZ3JpdHkgbm9uY2UgbGFuZ3VhZ2VcIlxuXHRzZWxlY3Q6IFwic2l6ZSBmb3JtIG11bHRpcGxlXCJcblx0dGV4dGFyZWE6IFwicm93cyBjb2xzXCJcblxuXG5JbWJhLkhUTUxfUFJPUFMgPVxuXHRpbnB1dDogXCJhdXRvZm9jdXMgYXV0b2NvbXBsZXRlIGF1dG9jb3JyZWN0IHZhbHVlIHBsYWNlaG9sZGVyIHJlcXVpcmVkIGRpc2FibGVkIG11bHRpcGxlIGNoZWNrZWQgcmVhZE9ubHlcIlxuXHR0ZXh0YXJlYTogXCJhdXRvZm9jdXMgYXV0b2NvbXBsZXRlIGF1dG9jb3JyZWN0IHZhbHVlIHBsYWNlaG9sZGVyIHJlcXVpcmVkIGRpc2FibGVkIG11bHRpcGxlIGNoZWNrZWQgcmVhZE9ubHlcIlxuXHRmb3JtOiBcIm5vdmFsaWRhdGVcIlxuXHRmaWVsZHNldDogXCJkaXNhYmxlZFwiXG5cdGJ1dHRvbjogXCJkaXNhYmxlZFwiXG5cdHNlbGVjdDogXCJhdXRvZm9jdXMgZGlzYWJsZWQgcmVxdWlyZWRcIlxuXHRvcHRpb246IFwiZGlzYWJsZWQgc2VsZWN0ZWQgdmFsdWVcIlxuXHRvcHRncm91cDogXCJkaXNhYmxlZFwiXG5cdHByb2dyZXNzOiBcInZhbHVlXCJcblx0ZmllbGRzZXQ6IFwiZGlzYWJsZWRcIlxuXHRjYW52YXM6IFwid2lkdGggaGVpZ2h0XCJcblxuZGVmIGV4dGVuZGVyIG9iaiwgc3VwXG5cdGZvciBvd24gayx2IG9mIHN1cFxuXHRcdG9ialtrXSA/PSB2XG5cblx0b2JqOnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwOnByb3RvdHlwZSlcblx0b2JqOl9fc3VwZXJfXyA9IG9iajpwcm90b3R5cGU6X19zdXBlcl9fID0gc3VwOnByb3RvdHlwZVxuXHRvYmo6cHJvdG90eXBlOmNvbnN0cnVjdG9yID0gb2JqXG5cdHN1cC5pbmhlcml0KG9iaikgaWYgc3VwOmluaGVyaXRcblx0cmV0dXJuIG9ialxuXG5kZWYgVGFnXG5cdHJldHVybiBkbyB8ZG9tLGN0eHxcblx0XHR0aGlzLmluaXRpYWxpemUoZG9tLGN0eClcblx0XHRyZXR1cm4gdGhpc1xuXG5kZWYgVGFnU3Bhd25lciB0eXBlXG5cdHJldHVybiBkbyB8em9uZXwgdHlwZS5idWlsZCh6b25lKVxuXG5cbmNsYXNzIEltYmEuVGFnc1xuXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0c2VsZlxuXG5cdGRlZiBfX2Nsb25lIG5zXG5cdFx0dmFyIGNsb25lID0gT2JqZWN0LmNyZWF0ZShzZWxmKVxuXHRcdGNsb25lLkBwYXJlbnQgPSBzZWxmXG5cdFx0cmV0dXJuIGNsb25lXG5cblx0ZGVmIG5zIG5hbWVcblx0XHRzZWxmWydfJyArIG5hbWUudG9VcHBlckNhc2VdIHx8IGRlZmluZU5hbWVzcGFjZShuYW1lKVxuXG5cdGRlZiBkZWZpbmVOYW1lc3BhY2UgbmFtZVxuXHRcdHZhciBjbG9uZSA9IE9iamVjdC5jcmVhdGUoc2VsZilcblx0XHRjbG9uZS5AcGFyZW50ID0gc2VsZlxuXHRcdGNsb25lLkBucyA9IG5hbWVcblx0XHRzZWxmWydfJyArIG5hbWUudG9VcHBlckNhc2VdID0gY2xvbmVcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgYmFzZVR5cGUgbmFtZSwgbnNcblx0XHRuYW1lIGluIEltYmEuSFRNTF9UQUdTID8gJ2VsZW1lbnQnIDogJ2RpdidcblxuXHRkZWYgZGVmaW5lVGFnIGZ1bGxOYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0aWYgYm9keSBhbmQgYm9keS5Abm9kZVR5cGVcblx0XHRcdHN1cHIgPSBib2R5XG5cdFx0XHRib2R5ID0gbnVsbFxuXHRcdFx0XG5cdFx0aWYgc2VsZltmdWxsTmFtZV1cblx0XHRcdGNvbnNvbGUubG9nIFwidGFnIGFscmVhZHkgZXhpc3RzP1wiLGZ1bGxOYW1lXG5cdFx0XG5cdFx0IyBpZiBpdCBpcyBuYW1lc3BhY2VkXG5cdFx0dmFyIG5zXG5cdFx0dmFyIG5hbWUgPSBmdWxsTmFtZVxuXHRcdGxldCBuc2lkeCA9IG5hbWUuaW5kZXhPZignOicpXG5cdFx0aWYgIG5zaWR4ID49IDBcblx0XHRcdG5zID0gZnVsbE5hbWUuc3Vic3RyKDAsbnNpZHgpXG5cdFx0XHRuYW1lID0gZnVsbE5hbWUuc3Vic3RyKG5zaWR4ICsgMSlcblx0XHRcdGlmIG5zID09ICdzdmcnIGFuZCAhc3VwclxuXHRcdFx0XHRzdXByID0gJ3N2ZzplbGVtZW50J1xuXG5cdFx0c3VwciB8fD0gYmFzZVR5cGUoZnVsbE5hbWUpXG5cblx0XHRsZXQgc3VwZXJ0eXBlID0gc3VwciBpc2EgU3RyaW5nID8gZmluZFRhZ1R5cGUoc3VwcikgOiBzdXByXG5cdFx0bGV0IHRhZ3R5cGUgPSBUYWcoKVxuXG5cdFx0dGFndHlwZS5AbmFtZSA9IG5hbWVcblx0XHR0YWd0eXBlLkBmbGFnTmFtZSA9IG51bGxcblxuXHRcdGlmIG5hbWVbMF0gPT0gJyMnXG5cdFx0XHRJbWJhLlNJTkdMRVRPTlNbbmFtZS5zbGljZSgxKV0gPSB0YWd0eXBlXG5cdFx0XHRzZWxmW25hbWVdID0gdGFndHlwZVxuXHRcdGVsaWYgbmFtZVswXSA9PSBuYW1lWzBdLnRvVXBwZXJDYXNlXG5cdFx0XHR0YWd0eXBlLkBmbGFnTmFtZSA9IG5hbWVcblx0XHRlbHNlXG5cdFx0XHR0YWd0eXBlLkBmbGFnTmFtZSA9IFwiX1wiICsgZnVsbE5hbWUucmVwbGFjZSgvW19cXDpdL2csICctJylcblx0XHRcdHNlbGZbZnVsbE5hbWVdID0gdGFndHlwZVxuXG5cdFx0ZXh0ZW5kZXIodGFndHlwZSxzdXBlcnR5cGUpXG5cblx0XHRpZiBib2R5XG5cdFx0XHRib2R5LmNhbGwodGFndHlwZSx0YWd0eXBlLCB0YWd0eXBlLlRBR1Mgb3Igc2VsZilcblx0XHRcdHRhZ3R5cGUuZGVmaW5lZCBpZiB0YWd0eXBlOmRlZmluZWRcblx0XHRcdG9wdGltaXplVGFnKHRhZ3R5cGUpXG5cdFx0cmV0dXJuIHRhZ3R5cGVcblxuXHRkZWYgZGVmaW5lU2luZ2xldG9uIG5hbWUsIHN1cHIsICZib2R5XG5cdFx0ZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5cdGRlZiBleHRlbmRUYWcgbmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRcdHZhciBrbGFzcyA9IChuYW1lIGlzYSBTdHJpbmcgPyBmaW5kVGFnVHlwZShuYW1lKSA6IG5hbWUpXG5cdFx0IyBhbGxvdyBmb3IgcHJpdmF0ZSB0YWdzIGhlcmUgYXMgd2VsbD9cblx0XHRib2R5IGFuZCBib2R5LmNhbGwoa2xhc3Msa2xhc3Msa2xhc3M6cHJvdG90eXBlKSBpZiBib2R5XG5cdFx0a2xhc3MuZXh0ZW5kZWQgaWYga2xhc3M6ZXh0ZW5kZWRcblx0XHRvcHRpbWl6ZVRhZyhrbGFzcylcblx0XHRyZXR1cm4ga2xhc3NcblxuXHRkZWYgb3B0aW1pemVUYWcgdGFndHlwZVxuXHRcdHRhZ3R5cGU6cHJvdG90eXBlPy5vcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXHRcdFxuXHRkZWYgZmluZFRhZ1R5cGUgdHlwZVxuXHRcdGxldCBrbGFzcyA9IHNlbGZbdHlwZV1cblx0XHR1bmxlc3Mga2xhc3Ncblx0XHRcdGlmIHR5cGUuc3Vic3RyKDAsNCkgPT0gJ3N2ZzonXG5cdFx0XHRcdGtsYXNzID0gZGVmaW5lVGFnKHR5cGUsJ3N2ZzplbGVtZW50JylcblxuXHRcdFx0ZWxpZiBJbWJhLkhUTUxfVEFHUy5pbmRleE9mKHR5cGUpID49IDBcblx0XHRcdFx0a2xhc3MgPSBkZWZpbmVUYWcodHlwZSwnZWxlbWVudCcpXG5cblx0XHRcdFx0aWYgbGV0IGF0dHJzID0gSW1iYS5IVE1MX0FUVFJTW3R5cGVdXG5cdFx0XHRcdFx0Zm9yIG5hbWUgaW4gYXR0cnMuc3BsaXQoXCIgXCIpXG5cdFx0XHRcdFx0XHRJbWJhLmF0dHIoa2xhc3MsbmFtZSlcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRpZiBsZXQgcHJvcHMgPSBJbWJhLkhUTUxfUFJPUFNbdHlwZV1cblx0XHRcdFx0XHRmb3IgbmFtZSBpbiBwcm9wcy5zcGxpdChcIiBcIilcblx0XHRcdFx0XHRcdEltYmEuYXR0cihrbGFzcyxuYW1lLGRvbTogeWVzKVxuXHRcdHJldHVybiBrbGFzc1xuXHRcdFxuXHRkZWYgY3JlYXRlRWxlbWVudCBuYW1lLCBvd25lclxuXHRcdHZhciB0eXBcblx0XHRpZiBuYW1lIGlzYSBGdW5jdGlvblxuXHRcdFx0dHlwID0gbmFtZVxuXHRcdGVsc2VcdFx0XHRcblx0XHRcdGlmICRkZWJ1ZyRcblx0XHRcdFx0dGhyb3coXCJjYW5ub3QgZmluZCB0YWctdHlwZSB7bmFtZX1cIikgdW5sZXNzIGZpbmRUYWdUeXBlKG5hbWUpXG5cdFx0XHR0eXAgPSBmaW5kVGFnVHlwZShuYW1lKVxuXHRcdHR5cC5idWlsZChvd25lcilcblxuXG5kZWYgSW1iYS5jcmVhdGVFbGVtZW50IG5hbWUsIGN0eCwgcmVmLCBwcmVmXG5cdHZhciB0eXBlID0gbmFtZVxuXHR2YXIgcGFyZW50XG5cdGlmIG5hbWUgaXNhIEZ1bmN0aW9uXG5cdFx0dHlwZSA9IG5hbWVcblx0ZWxzZVxuXHRcdGlmICRkZWJ1ZyRcblx0XHRcdHRocm93KFwiY2Fubm90IGZpbmQgdGFnLXR5cGUge25hbWV9XCIpIHVubGVzcyBJbWJhLlRBR1MuZmluZFRhZ1R5cGUobmFtZSlcblx0XHR0eXBlID0gSW1iYS5UQUdTLmZpbmRUYWdUeXBlKG5hbWUpXG5cdFxuXHRpZiBjdHggaXNhIFRhZ01hcFxuXHRcdHBhcmVudCA9IGN0eDpwYXIkXG5cdGVsaWYgcHJlZiBpc2EgSW1iYS5UYWdcblx0XHRwYXJlbnQgPSBwcmVmXG5cdGVsc2Vcblx0XHRwYXJlbnQgPSBjdHggYW5kIHByZWYgIT0gdW5kZWZpbmVkID8gY3R4W3ByZWZdIDogKGN0eCBhbmQgY3R4LkB0YWcgb3IgY3R4KVxuXG5cdHZhciBub2RlID0gdHlwZS5idWlsZChwYXJlbnQpXG5cdFxuXHRpZiBjdHggaXNhIFRhZ01hcFxuXHRcdGN0eDppJCsrXG5cdFx0bm9kZToka2V5ID0gcmVmXG5cblx0IyBub2RlOiRyZWYgPSByZWYgaWYgcmVmXG5cdCMgY29udGV4dDppJCsrICMgb25seSBpZiBpdCBpcyBub3QgYW4gYXJyYXk/XG5cdGlmIGN0eCBhbmQgcmVmICE9IHVuZGVmaW5lZFxuXHRcdGN0eFtyZWZdID0gbm9kZVxuXG5cdHJldHVybiBub2RlXG5cbmRlZiBJbWJhLmNyZWF0ZVRhZ0NhY2hlIG93bmVyXG5cdHZhciBpdGVtID0gW11cblx0aXRlbS5AdGFnID0gb3duZXJcblx0cmV0dXJuIGl0ZW1cblxuXHR2YXIgcGFyID0gKHByZWYgIT0gdW5kZWZpbmVkID8gY3R4W3ByZWZdIDogY3R4LkB0YWcpXG5cdHZhciBub2RlID0gVGFnTWFwLm5ldyhjdHgscmVmLHBhcilcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cdFxuZGVmIEltYmEuY3JlYXRlVGFnTWFwIGN0eCwgcmVmLCBwcmVmXG5cdHZhciBwYXIgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBwcmVmIDogY3R4LkB0YWcpXG5cdHZhciBub2RlID0gVGFnTWFwLm5ldyhjdHgscmVmLHBhcilcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cbmRlZiBJbWJhLmNyZWF0ZVRhZ0xpc3QgY3R4LCByZWYsIHByZWZcblx0dmFyIG5vZGUgPSBbXVxuXHRub2RlLkB0eXBlID0gNFxuXHRub2RlLkB0YWcgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBwcmVmIDogY3R4LkB0YWcpXG5cdGN0eFtyZWZdID0gbm9kZVxuXHRyZXR1cm4gbm9kZVxuXG5kZWYgSW1iYS5jcmVhdGVUYWdMb29wUmVzdWx0IGN0eCwgcmVmLCBwcmVmXG5cdHZhciBub2RlID0gW11cblx0bm9kZS5AdHlwZSA9IDVcblx0bm9kZTpjYWNoZSA9IHtpJDogMH1cblx0cmV0dXJuIG5vZGVcblxuIyB1c2UgYXJyYXkgaW5zdGVhZD9cbmNsYXNzIFRhZ0NhY2hlXG5cdGRlZiBzZWxmLmJ1aWxkIG93bmVyXG5cdFx0dmFyIGl0ZW0gPSBbXVxuXHRcdGl0ZW0uQHRhZyA9IG93bmVyXG5cdFx0cmV0dXJuIGl0ZW1cblxuXHRkZWYgaW5pdGlhbGl6ZSBvd25lclxuXHRcdHNlbGYuQHRhZyA9IG93bmVyXG5cdFx0c2VsZlxuXHRcbmNsYXNzIFRhZ01hcFxuXHRcblx0ZGVmIGluaXRpYWxpemUgY2FjaGUsIHJlZiwgcGFyXG5cdFx0c2VsZjpjYWNoZSQgPSBjYWNoZVxuXHRcdHNlbGY6a2V5JCA9IHJlZlxuXHRcdHNlbGY6cGFyJCA9IHBhclxuXHRcdHNlbGY6aSQgPSAwXG5cdFx0IyBzZWxmOmN1cnIkID0gc2VsZjokaXRlcm5ldygpXG5cdFx0IyBzZWxmOm5leHQkID0gc2VsZjokaXRlcm5ldygpXG5cdFxuXHRkZWYgJGl0ZXJcblx0XHR2YXIgaXRlbSA9IFtdXG5cdFx0aXRlbS5AdHlwZSA9IDVcblx0XHRpdGVtOnN0YXRpYyA9IDUgIyB3cm9uZyghKVxuXHRcdGl0ZW06Y2FjaGUgPSBzZWxmXG5cdFx0cmV0dXJuIGl0ZW1cblx0XHRcblx0ZGVmICRwcnVuZSBpdGVtc1xuXHRcdGxldCBjYWNoZSA9IHNlbGY6Y2FjaGUkXG5cdFx0bGV0IGtleSA9IHNlbGY6a2V5JFxuXHRcdGxldCBjbG9uZSA9IFRhZ01hcC5uZXcoY2FjaGUsa2V5LHNlbGY6cGFyJClcblx0XHRmb3IgaXRlbSBpbiBpdGVtc1xuXHRcdFx0Y2xvbmVbaXRlbTprZXkkXSA9IGl0ZW1cblx0XHRjbG9uZTppJCA9IGl0ZW1zOmxlbmd0aFxuXHRcdHJldHVybiBjYWNoZVtrZXldID0gY2xvbmVcblxuSW1iYS5UYWdNYXAgPSBUYWdNYXBcbkltYmEuVGFnQ2FjaGUgPSBUYWdDYWNoZVxuSW1iYS5TSU5HTEVUT05TID0ge31cbkltYmEuVEFHUyA9IEltYmEuVGFncy5uZXdcbkltYmEuVEFHU1s6ZWxlbWVudF0gPSBJbWJhLlRBR1NbOmh0bWxlbGVtZW50XSA9IEltYmEuVGFnXG5JbWJhLlRBR1NbJ3N2ZzplbGVtZW50J10gPSBJbWJhLlNWR1RhZ1xuXG5kZWYgSW1iYS5kZWZpbmVUYWcgbmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRyZXR1cm4gSW1iYS5UQUdTLmRlZmluZVRhZyhuYW1lLHN1cHIsYm9keSlcblxuZGVmIEltYmEuZGVmaW5lU2luZ2xldG9uVGFnIGlkLCBzdXByID0gJ2RpdicsICZib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5kZWYgSW1iYS5leHRlbmRUYWcgbmFtZSwgYm9keVxuXHRyZXR1cm4gSW1iYS5UQUdTLmV4dGVuZFRhZyhuYW1lLGJvZHkpXG5cbmRlZiBJbWJhLmdldFRhZ1NpbmdsZXRvbiBpZFx0XG5cdHZhciBkb20sIG5vZGVcblxuXHRpZiB2YXIga2xhc3MgPSBJbWJhLlNJTkdMRVRPTlNbaWRdXG5cdFx0cmV0dXJuIGtsYXNzLkluc3RhbmNlIGlmIGtsYXNzIGFuZCBrbGFzcy5JbnN0YW5jZSBcblxuXHRcdCMgbm8gaW5zdGFuY2UgLSBjaGVjayBmb3IgZWxlbWVudFxuXHRcdGlmIGRvbSA9IEltYmEuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0XHQjIHdlIGhhdmUgYSBsaXZlIGluc3RhbmNlIC0gd2hlbiBmaW5kaW5nIGl0IHRocm91Z2ggYSBzZWxlY3RvciB3ZSBzaG91bGQgYXdha2UgaXQsIG5vP1xuXHRcdFx0IyBjb25zb2xlLmxvZygnY3JlYXRpbmcgdGhlIHNpbmdsZXRvbiBmcm9tIGV4aXN0aW5nIG5vZGUgaW4gZG9tPycsaWQsdHlwZSlcblx0XHRcdG5vZGUgPSBrbGFzcy5JbnN0YW5jZSA9IGtsYXNzLm5ldyhkb20pXG5cdFx0XHRub2RlLmF3YWtlbihkb20pICMgc2hvdWxkIG9ubHkgYXdha2VuXG5cdFx0XHRyZXR1cm4gbm9kZVxuXG5cdFx0ZG9tID0ga2xhc3MuY3JlYXRlTm9kZVxuXHRcdGRvbTppZCA9IGlkXG5cdFx0bm9kZSA9IGtsYXNzLkluc3RhbmNlID0ga2xhc3MubmV3KGRvbSlcblx0XHRub2RlLmVuZC5hd2FrZW4oZG9tKVxuXHRcdHJldHVybiBub2RlXG5cdGVsaWYgZG9tID0gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHRyZXR1cm4gSW1iYS5nZXRUYWdGb3JEb20oZG9tKVxuXG52YXIgc3ZnU3VwcG9ydCA9IHR5cGVvZiBTVkdFbGVtZW50ICE9PSAndW5kZWZpbmVkJ1xuXG4jIHNodW9sZCBiZSBwaGFzZWQgb3V0XG5kZWYgSW1iYS5nZXRUYWdGb3JEb20gZG9tXG5cdHJldHVybiBudWxsIHVubGVzcyBkb21cblx0cmV0dXJuIGRvbSBpZiBkb20uQGRvbSAjIGNvdWxkIHVzZSBpbmhlcml0YW5jZSBpbnN0ZWFkXG5cdHJldHVybiBkb20uQHRhZyBpZiBkb20uQHRhZ1xuXHRyZXR1cm4gbnVsbCB1bmxlc3MgZG9tOm5vZGVOYW1lXG5cblx0dmFyIG5hbWUgPSBkb206bm9kZU5hbWUudG9Mb3dlckNhc2Vcblx0dmFyIHR5cGUgPSBuYW1lXG5cdHZhciBucyA9IEltYmEuVEFHUyAjICBzdmdTdXBwb3J0IGFuZCBkb20gaXNhIFNWR0VsZW1lbnQgPyBJbWJhLlRBR1M6X1NWRyA6IEltYmEuVEFHU1xuXG5cdGlmIGRvbTppZCBhbmQgSW1iYS5TSU5HTEVUT05TW2RvbTppZF1cblx0XHRyZXR1cm4gSW1iYS5nZXRUYWdTaW5nbGV0b24oZG9tOmlkKVxuXHRcdFxuXHRpZiBzdmdTdXBwb3J0IGFuZCBkb20gaXNhIFNWR0VsZW1lbnRcblx0XHR0eXBlID0gbnMuZmluZFRhZ1R5cGUoXCJzdmc6XCIgKyBuYW1lKVxuXHRlbGlmIEltYmEuSFRNTF9UQUdTLmluZGV4T2YobmFtZSkgPj0gMFxuXHRcdHR5cGUgPSBucy5maW5kVGFnVHlwZShuYW1lKVxuXHRlbHNlXG5cdFx0dHlwZSA9IEltYmEuVGFnXG5cdCMgaWYgbnMuQG5vZGVOYW1lcy5pbmRleE9mKG5hbWUpID49IDBcblx0I1x0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKG5hbWUpXG5cblx0cmV0dXJuIHR5cGUubmV3KGRvbSxudWxsKS5hd2FrZW4oZG9tKVxuXG4jIGRlcHJlY2F0ZVxuZGVmIEltYmEuZ2VuZXJhdGVDU1NQcmVmaXhlc1xuXHR2YXIgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50LCAnJylcblxuXHRmb3IgcHJlZml4ZWQgaW4gc3R5bGVzXG5cdFx0dmFyIHVucHJlZml4ZWQgPSBwcmVmaXhlZC5yZXBsYWNlKC9eLSh3ZWJraXR8bXN8bW96fG98YmxpbmspLS8sJycpXG5cdFx0dmFyIGNhbWVsQ2FzZSA9IHVucHJlZml4ZWQucmVwbGFjZSgvLShcXHcpL2cpIGRvIHxtLGF8IGEudG9VcHBlckNhc2VcblxuXHRcdCMgaWYgdGhlcmUgZXhpc3RzIGFuIHVucHJlZml4ZWQgdmVyc2lvbiAtLSBhbHdheXMgdXNlIHRoaXNcblx0XHRpZiBwcmVmaXhlZCAhPSB1bnByZWZpeGVkXG5cdFx0XHRjb250aW51ZSBpZiBzdHlsZXMuaGFzT3duUHJvcGVydHkodW5wcmVmaXhlZClcblxuXHRcdCMgcmVnaXN0ZXIgdGhlIHByZWZpeGVzXG5cdFx0SW1iYS5DU1NLZXlNYXBbdW5wcmVmaXhlZF0gPSBJbWJhLkNTU0tleU1hcFtjYW1lbENhc2VdID0gcHJlZml4ZWRcblx0cmV0dXJuXG5cbmlmICR3ZWIkXG5cdEltYmEuZ2VuZXJhdGVDU1NQcmVmaXhlcyBpZiBkb2N1bWVudFxuXG5cdCMgT3Z2ZXJyaWRlIGNsYXNzTGlzdFxuXHRpZiBkb2N1bWVudCBhbmQgIWRvY3VtZW50OmRvY3VtZW50RWxlbWVudDpjbGFzc0xpc3Rcblx0XHRleHRlbmQgdGFnIGVsZW1lbnRcblxuXHRcdFx0ZGVmIGhhc0ZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBSZWdFeHAubmV3KCcoXnxcXFxccyknICsgcmVmICsgJyhcXFxcc3wkKScpLnRlc3QoQGRvbTpjbGFzc05hbWUpXG5cblx0XHRcdGRlZiBhZGRGbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZiBpZiBoYXNGbGFnKHJlZilcblx0XHRcdFx0QGRvbTpjbGFzc05hbWUgKz0gKEBkb206Y2xhc3NOYW1lID8gJyAnIDogJycpICsgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRcdGRlZiB1bmZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmIHVubGVzcyBoYXNGbGFnKHJlZilcblx0XHRcdFx0dmFyIHJlZ2V4ID0gUmVnRXhwLm5ldygnKF58XFxcXHMpKicgKyByZWYgKyAnKFxcXFxzfCQpKicsICdnJylcblx0XHRcdFx0QGRvbTpjbGFzc05hbWUgPSBAZG9tOmNsYXNzTmFtZS5yZXBsYWNlKHJlZ2V4LCAnJylcblx0XHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdFx0ZGVmIHRvZ2dsZUZsYWcgcmVmXG5cdFx0XHRcdGhhc0ZsYWcocmVmKSA/IHVuZmxhZyhyZWYpIDogZmxhZyhyZWYpXG5cblx0XHRcdGRlZiBmbGFnIHJlZiwgYm9vbFxuXHRcdFx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDIgYW5kICEhYm9vbCA9PT0gbm9cblx0XHRcdFx0XHRyZXR1cm4gdW5mbGFnKHJlZilcblx0XHRcdFx0cmV0dXJuIGFkZEZsYWcocmVmKVxuXG5JbWJhLlRhZ1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3RhZy5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG4jIHByZWRlZmluZSBhbGwgc3VwcG9ydGVkIGh0bWwgdGFnc1xudGFnIGZyYWdtZW50IDwgZWxlbWVudFxuXG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHRJbWJhLmRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnRcblxuZXh0ZW5kIHRhZyBodG1sXG5cdGRlZiBwYXJlbnRcblx0XHRudWxsXG5cblxuZXh0ZW5kIHRhZyBjYW52YXNcblx0ZGVmIGNvbnRleHQgdHlwZSA9ICcyZCdcblx0XHRkb20uZ2V0Q29udGV4dCh0eXBlKVxuXG5jbGFzcyBEYXRhUHJveHlcdFxuXHRkZWYgc2VsZi5iaW5kIHJlY2VpdmVyLCBkYXRhLCBwYXRoLCBhcmdzXG5cdFx0bGV0IHByb3h5ID0gcmVjZWl2ZXIuQGRhdGEgfHw9IHNlbGYubmV3KHJlY2VpdmVyLHBhdGgsYXJncylcblx0XHRwcm94eS5iaW5kKGRhdGEscGF0aCxhcmdzKVxuXHRcdHJldHVybiByZWNlaXZlclxuXG5cdGRlZiBpbml0aWFsaXplIG5vZGUsIHBhdGgsIGFyZ3Ncblx0XHRAbm9kZSA9IG5vZGVcblx0XHRAcGF0aCA9IHBhdGhcblx0XHRAYXJncyA9IGFyZ3Ncblx0XHRAc2V0dGVyID0gSW1iYS50b1NldHRlcihAcGF0aCkgaWYgQGFyZ3Ncblx0XHRcblx0ZGVmIGJpbmQgZGF0YSwga2V5LCBhcmdzXG5cdFx0aWYgZGF0YSAhPSBAZGF0YVxuXHRcdFx0QGRhdGEgPSBkYXRhXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgZ2V0Rm9ybVZhbHVlXG5cdFx0QHNldHRlciA/IEBkYXRhW0BwYXRoXSgpIDogQGRhdGFbQHBhdGhdXG5cblx0ZGVmIHNldEZvcm1WYWx1ZSB2YWx1ZVxuXHRcdEBzZXR0ZXIgPyBAZGF0YVtAc2V0dGVyXSh2YWx1ZSkgOiAoQGRhdGFbQHBhdGhdID0gdmFsdWUpXG5cblxudmFyIGlzQXJyYXkgPSBkbyB8dmFsfFxuXHR2YWwgYW5kIHZhbDpzcGxpY2UgYW5kIHZhbDpzb3J0XG5cbnZhciBpc1NpbWlsYXJBcnJheSA9IGRvIHxhLGJ8XG5cdGxldCBsID0gYTpsZW5ndGgsIGkgPSAwXG5cdHJldHVybiBubyB1bmxlc3MgbCA9PSBiOmxlbmd0aFxuXHR3aGlsZSBpKysgPCBsXG5cdFx0cmV0dXJuIG5vIGlmIGFbaV0gIT0gYltpXVxuXHRyZXR1cm4geWVzXG5cbmV4dGVuZCB0YWcgaW5wdXRcblx0cHJvcCBsYXp5XG5cblx0ZGVmIHNldE1vZGVsXG5cdFx0Y29uc29sZS53YXJuIFwic2V0TW9kZWwgcmVtb3ZlZC4gVXNlIDxpbnB1dFtkYXRhOnBhdGhdPlwiXG5cdFx0cmV0dXJuIHNlbGZcblx0XG5cdGRlZiBiaW5kRGF0YSB0YXJnZXQsIHBhdGgsIGFyZ3Ncblx0XHREYXRhUHJveHkuYmluZChzZWxmLHRhcmdldCxwYXRoLGFyZ3MpXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRkb206dmFsdWUgPSBAdmFsdWUgPSB2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgb25pbnB1dCBlXG5cdFx0bGV0IHZhbCA9IEBkb206dmFsdWVcblx0XHRAbG9jYWxWYWx1ZSA9IEBpbml0aWFsVmFsdWUgIT0gdmFsID8gdmFsIDogdW5kZWZpbmVkXG5cdFx0QGRhdGEgYW5kICFsYXp5ID8gQGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlLHNlbGYpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0QG1vZGVsVmFsdWUgPSBAbG9jYWxWYWx1ZSA9IHVuZGVmaW5lZFxuXHRcdHJldHVybiBlLnNpbGVuY2UgdW5sZXNzIGRhdGFcblx0XHRcblx0XHRpZiB0eXBlID09ICdyYWRpbycgb3IgdHlwZSA9PSAnY2hlY2tib3gnXG5cdFx0XHRsZXQgY2hlY2tlZCA9IEBkb206Y2hlY2tlZFxuXHRcdFx0bGV0IG12YWwgPSBAZGF0YS5nZXRGb3JtVmFsdWUoc2VsZilcblx0XHRcdGxldCBkdmFsID0gQHZhbHVlICE9IHVuZGVmaW5lZCA/IEB2YWx1ZSA6IHZhbHVlXG5cblx0XHRcdGlmIHR5cGUgPT0gJ3JhZGlvJ1xuXHRcdFx0XHRAZGF0YS5zZXRGb3JtVmFsdWUoZHZhbCxzZWxmKVxuXHRcdFx0ZWxpZiBkb206dmFsdWUgPT0gJ29uJ1xuXHRcdFx0XHRAZGF0YS5zZXRGb3JtVmFsdWUoISFjaGVja2VkLHNlbGYpXG5cdFx0XHRlbGlmIGlzQXJyYXkobXZhbClcblx0XHRcdFx0bGV0IGlkeCA9IG12YWwuaW5kZXhPZihkdmFsKVxuXHRcdFx0XHRpZiBjaGVja2VkIGFuZCBpZHggPT0gLTFcblx0XHRcdFx0XHRtdmFsLnB1c2goZHZhbClcblx0XHRcdFx0ZWxpZiAhY2hlY2tlZCBhbmQgaWR4ID49IDBcblx0XHRcdFx0XHRtdmFsLnNwbGljZShpZHgsMSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0QGRhdGEuc2V0Rm9ybVZhbHVlKGR2YWwsc2VsZilcblx0XHRlbHNlXG5cdFx0XHRAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUpXG5cdFxuXHQjIG92ZXJyaWRpbmcgZW5kIGRpcmVjdGx5IGZvciBwZXJmb3JtYW5jZVxuXHRkZWYgZW5kXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBkYXRhIG9yIEBsb2NhbFZhbHVlICE9PSB1bmRlZmluZWRcblx0XHRsZXQgbXZhbCA9IEBkYXRhLmdldEZvcm1WYWx1ZShzZWxmKVxuXHRcdHJldHVybiBzZWxmIGlmIG12YWwgPT0gQG1vZGVsVmFsdWVcblx0XHRAbW9kZWxWYWx1ZSA9IG12YWwgdW5sZXNzIGlzQXJyYXkobXZhbClcblxuXHRcdGlmIHR5cGUgPT0gJ3JhZGlvJyBvciB0eXBlID09ICdjaGVja2JveCdcblx0XHRcdGxldCBkdmFsID0gQHZhbHVlXG5cdFx0XHRsZXQgY2hlY2tlZCA9IGlmIGlzQXJyYXkobXZhbClcblx0XHRcdFx0bXZhbC5pbmRleE9mKGR2YWwpID49IDBcblx0XHRcdGVsaWYgZG9tOnZhbHVlID09ICdvbidcblx0XHRcdFx0ISFtdmFsXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG12YWwgPT0gQHZhbHVlXG5cblx0XHRcdEBkb206Y2hlY2tlZCA9IGNoZWNrZWRcblx0XHRlbHNlXG5cdFx0XHRAZG9tOnZhbHVlID0gbXZhbFxuXHRcdFx0QGluaXRpYWxWYWx1ZSA9IEBkb206dmFsdWVcblx0XHRzZWxmXG5cbmV4dGVuZCB0YWcgdGV4dGFyZWFcblx0cHJvcCBsYXp5XG5cblx0ZGVmIHNldE1vZGVsIHZhbHVlLCBtb2RzXG5cdFx0Y29uc29sZS53YXJuIFwic2V0TW9kZWwgcmVtb3ZlZC4gVXNlIDx0ZXh0YXJlYVtkYXRhOnBhdGhdPlwiXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0ZGVmIGJpbmREYXRhIHRhcmdldCwgcGF0aCwgYXJnc1xuXHRcdERhdGFQcm94eS5iaW5kKHNlbGYsdGFyZ2V0LHBhdGgsYXJncylcblx0XHRzZWxmXG5cdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRkb206dmFsdWUgPSB2YWx1ZSBpZiBAbG9jYWxWYWx1ZSA9PSB1bmRlZmluZWRcblx0XHRyZXR1cm4gc2VsZlxuXHRcblx0ZGVmIG9uaW5wdXQgZVxuXHRcdGxldCB2YWwgPSBAZG9tOnZhbHVlXG5cdFx0QGxvY2FsVmFsdWUgPSBAaW5pdGlhbFZhbHVlICE9IHZhbCA/IHZhbCA6IHVuZGVmaW5lZFxuXHRcdEBkYXRhIGFuZCAhbGF6eSA/IEBkYXRhLnNldEZvcm1WYWx1ZSh2YWx1ZSxzZWxmKSA6IGUuc2lsZW5jZVxuXG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0QGxvY2FsVmFsdWUgPSB1bmRlZmluZWRcblx0XHRAZGF0YSA/IEBkYXRhLnNldEZvcm1WYWx1ZSh2YWx1ZSxzZWxmKSA6IGUuc2lsZW5jZVxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIGlmIEBsb2NhbFZhbHVlICE9IHVuZGVmaW5lZCBvciAhQGRhdGFcblx0XHRpZiBAZGF0YVxuXHRcdFx0bGV0IGR2YWwgPSBAZGF0YS5nZXRGb3JtVmFsdWUoc2VsZilcblx0XHRcdEBkb206dmFsdWUgPSBkdmFsICE9IHVuZGVmaW5lZCA/IGR2YWwgOiAnJ1xuXHRcdEBpbml0aWFsVmFsdWUgPSBAZG9tOnZhbHVlXG5cdFx0c2VsZlxuXG5leHRlbmQgdGFnIG9wdGlvblxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRpZiB2YWx1ZSAhPSBAdmFsdWVcblx0XHRcdGRvbTp2YWx1ZSA9IEB2YWx1ZSA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiB2YWx1ZVxuXHRcdEB2YWx1ZSBvciBkb206dmFsdWVcblxuZXh0ZW5kIHRhZyBzZWxlY3Rcblx0ZGVmIGJpbmREYXRhIHRhcmdldCwgcGF0aCwgYXJnc1xuXHRcdERhdGFQcm94eS5iaW5kKHNlbGYsdGFyZ2V0LHBhdGgsYXJncylcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBzZXRNb2RlbCB2YWx1ZSwgbW9kc1xuXHRcdGNvbnNvbGUud2FybiBcInNldE1vZGVsIHJlbW92ZWQuIFVzZSA8c2VsZWN0W2RhdGE6cGF0aF0+XCJcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWUsIHN5bmNpbmdcblx0XHRsZXQgcHJldiA9IEB2YWx1ZVxuXHRcdEB2YWx1ZSA9IHZhbHVlXG5cdFx0c3luY1ZhbHVlKHZhbHVlKSB1bmxlc3Mgc3luY2luZ1xuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdGRlZiBzeW5jVmFsdWUgdmFsdWVcblx0XHRsZXQgcHJldiA9IEBzeW5jVmFsdWVcblx0XHQjIGNoZWNrIGlmIHZhbHVlIGhhcyBjaGFuZ2VkXG5cdFx0aWYgbXVsdGlwbGUgYW5kIHZhbHVlIGlzYSBBcnJheVxuXHRcdFx0aWYgcHJldiBpc2EgQXJyYXkgYW5kIGlzU2ltaWxhckFycmF5KHByZXYsdmFsdWUpXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cdFx0XHQjIGNyZWF0ZSBhIGNvcHkgZm9yIHN5bmNWYWx1ZVxuXHRcdFx0dmFsdWUgPSB2YWx1ZS5zbGljZVxuXG5cdFx0QHN5bmNWYWx1ZSA9IHZhbHVlXG5cdFx0IyBzdXBwb3J0IGFycmF5IGZvciBtdWx0aXBsZT9cblx0XHRpZiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCdcblx0XHRcdGxldCBtdWx0ID0gbXVsdGlwbGUgYW5kIHZhbHVlIGlzYSBBcnJheVxuXHRcdFx0XG5cdFx0XHRmb3Igb3B0LGkgaW4gZG9tOm9wdGlvbnNcblx0XHRcdFx0bGV0IG92YWwgPSAob3B0LkB0YWcgPyBvcHQuQHRhZy52YWx1ZSA6IG9wdDp2YWx1ZSlcblx0XHRcdFx0aWYgbXVsdFxuXHRcdFx0XHRcdG9wdDpzZWxlY3RlZCA9IHZhbHVlLmluZGV4T2Yob3ZhbCkgPj0gMFxuXHRcdFx0XHRlbGlmIHZhbHVlID09IG92YWxcblx0XHRcdFx0XHRkb206c2VsZWN0ZWRJbmRleCA9IGlcblx0XHRcdFx0XHRicmVha1xuXHRcdGVsc2Vcblx0XHRcdGRvbTp2YWx1ZSA9IHZhbHVlXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgdmFsdWVcblx0XHRpZiBtdWx0aXBsZVxuXHRcdFx0Zm9yIG9wdGlvbiBpbiBkb206c2VsZWN0ZWRPcHRpb25zXG5cdFx0XHRcdG9wdGlvbi5AdGFnID8gb3B0aW9uLkB0YWcudmFsdWUgOiBvcHRpb246dmFsdWVcblx0XHRlbHNlXG5cdFx0XHRsZXQgb3B0ID0gZG9tOnNlbGVjdGVkT3B0aW9uc1swXVxuXHRcdFx0b3B0ID8gKG9wdC5AdGFnID8gb3B0LkB0YWcudmFsdWUgOiBvcHQ6dmFsdWUpIDogbnVsbFxuXHRcblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRAZGF0YSA/IEBkYXRhLnNldEZvcm1WYWx1ZSh2YWx1ZSxzZWxmKSA6IGUuc2lsZW5jZVxuXHRcdFxuXHRkZWYgZW5kXG5cdFx0aWYgQGRhdGFcblx0XHRcdHNldFZhbHVlKEBkYXRhLmdldEZvcm1WYWx1ZShzZWxmKSwxKVxuXG5cdFx0aWYgQHZhbHVlICE9IEBzeW5jVmFsdWVcblx0XHRcdHN5bmNWYWx1ZShAdmFsdWUpXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9odG1sLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbiMgSW1iYS5Ub3VjaFxuIyBCZWdhblx0QSBmaW5nZXIgdG91Y2hlZCB0aGUgc2NyZWVuLlxuIyBNb3ZlZFx0QSBmaW5nZXIgbW92ZWQgb24gdGhlIHNjcmVlbi5cbiMgU3RhdGlvbmFyeVx0QSBmaW5nZXIgaXMgdG91Y2hpbmcgdGhlIHNjcmVlbiBidXQgaGFzbid0IG1vdmVkLlxuIyBFbmRlZFx0QSBmaW5nZXIgd2FzIGxpZnRlZCBmcm9tIHRoZSBzY3JlZW4uIFRoaXMgaXMgdGhlIGZpbmFsIHBoYXNlIG9mIGEgdG91Y2guXG4jIENhbmNlbGVkIFRoZSBzeXN0ZW0gY2FuY2VsbGVkIHRyYWNraW5nIGZvciB0aGUgdG91Y2guXG5cbiMjI1xuQ29uc29saWRhdGVzIG1vdXNlIGFuZCB0b3VjaCBldmVudHMuIFRvdWNoIG9iamVjdHMgcGVyc2lzdCBhY3Jvc3MgYSB0b3VjaCxcbmZyb20gdG91Y2hzdGFydCB1bnRpbCBlbmQvY2FuY2VsLiBXaGVuIGEgdG91Y2ggc3RhcnRzLCBpdCB3aWxsIHRyYXZlcnNlXG5kb3duIGZyb20gdGhlIGlubmVybW9zdCB0YXJnZXQsIHVudGlsIGl0IGZpbmRzIGEgbm9kZSB0aGF0IHJlc3BvbmRzIHRvXG5vbnRvdWNoc3RhcnQuIFVubGVzcyB0aGUgdG91Y2ggaXMgZXhwbGljaXRseSByZWRpcmVjdGVkLCB0aGUgdG91Y2ggd2lsbFxuY2FsbCBvbnRvdWNobW92ZSBhbmQgb250b3VjaGVuZCAvIG9udG91Y2hjYW5jZWwgb24gdGhlIHJlc3BvbmRlciB3aGVuIGFwcHJvcHJpYXRlLlxuXG5cdHRhZyBkcmFnZ2FibGVcblx0XHQjIGNhbGxlZCB3aGVuIGEgdG91Y2ggc3RhcnRzXG5cdFx0ZGVmIG9udG91Y2hzdGFydCB0b3VjaFxuXHRcdFx0ZmxhZyAnZHJhZ2dpbmcnXG5cdFx0XHRzZWxmXG5cdFx0XG5cdFx0IyBjYWxsZWQgd2hlbiB0b3VjaCBtb3ZlcyAtIHNhbWUgdG91Y2ggb2JqZWN0XG5cdFx0ZGVmIG9udG91Y2htb3ZlIHRvdWNoXG5cdFx0XHQjIG1vdmUgdGhlIG5vZGUgd2l0aCB0b3VjaFxuXHRcdFx0Y3NzIHRvcDogdG91Y2guZHksIGxlZnQ6IHRvdWNoLmR4XG5cdFx0XG5cdFx0IyBjYWxsZWQgd2hlbiB0b3VjaCBlbmRzXG5cdFx0ZGVmIG9udG91Y2hlbmQgdG91Y2hcblx0XHRcdHVuZmxhZyAnZHJhZ2dpbmcnXG5cbkBpbmFtZSB0b3VjaFxuIyMjXG5jbGFzcyBJbWJhLlRvdWNoXG5cdHNlbGYuTGFzdFRpbWVzdGFtcCA9IDBcblx0c2VsZi5UYXBUaW1lb3V0ID0gNTBcblxuXHQjIHZhciBsYXN0TmF0aXZlVG91Y2hUaW1lb3V0ID0gNTBcblxuXHR2YXIgdG91Y2hlcyA9IFtdXG5cdHZhciBjb3VudCA9IDBcblx0dmFyIGlkZW50aWZpZXJzID0ge31cblxuXHRkZWYgc2VsZi5jb3VudFxuXHRcdGNvdW50XG5cblx0ZGVmIHNlbGYubG9va3VwIGl0ZW1cblx0XHRyZXR1cm4gaXRlbSBhbmQgKGl0ZW06X190b3VjaF9fIG9yIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl0pXG5cblx0ZGVmIHNlbGYucmVsZWFzZSBpdGVtLHRvdWNoXG5cdFx0ZGVsZXRlIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl1cblx0XHRkZWxldGUgaXRlbTpfX3RvdWNoX19cblx0XHRyZXR1cm5cblxuXHRkZWYgc2VsZi5vbnRvdWNoc3RhcnQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGNvbnRpbnVlIGlmIGxvb2t1cCh0KVxuXHRcdFx0dmFyIHRvdWNoID0gaWRlbnRpZmllcnNbdDppZGVudGlmaWVyXSA9IHNlbGYubmV3KGUpICMgKGUpXG5cdFx0XHR0Ol9fdG91Y2hfXyA9IHRvdWNoXG5cdFx0XHR0b3VjaGVzLnB1c2godG91Y2gpXG5cdFx0XHRjb3VudCsrXG5cdFx0XHR0b3VjaC50b3VjaHN0YXJ0KGUsdClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaG1vdmUgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaG1vdmUoZSx0KVxuXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hlbmQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGVuZChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXG5cdFx0IyBlLnByZXZlbnREZWZhdWx0XG5cdFx0IyBub3QgYWx3YXlzIHN1cHBvcnRlZCFcblx0XHQjIHRvdWNoZXMgPSB0b3VjaGVzLmZpbHRlcih8fClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaGNhbmNlbCBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0aWYgdmFyIHRvdWNoID0gbG9va3VwKHQpXG5cdFx0XHRcdHRvdWNoLnRvdWNoY2FuY2VsKGUsdClcblx0XHRcdFx0cmVsZWFzZSh0LHRvdWNoKVxuXHRcdFx0XHRjb3VudC0tXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vkb3duIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZW1vdmUgZVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNldXAgZVxuXHRcdHNlbGZcblxuXG5cdHByb3AgcGhhc2Vcblx0cHJvcCBhY3RpdmVcblx0cHJvcCBldmVudFxuXHRwcm9wIHBvaW50ZXJcblx0cHJvcCB0YXJnZXRcblx0cHJvcCBoYW5kbGVyXG5cdHByb3AgdXBkYXRlc1xuXHRwcm9wIHN1cHByZXNzXG5cdHByb3AgZGF0YVxuXHRwcm9wIGJ1YmJsZSBjaGFpbmFibGU6IHllc1xuXHRwcm9wIHRpbWVzdGFtcFxuXG5cdHByb3AgZ2VzdHVyZXNcblxuXHQjIyNcblx0QGludGVybmFsXG5cdEBjb25zdHJ1Y3RvclxuXHQjIyNcblx0ZGVmIGluaXRpYWxpemUgZXZlbnQsIHBvaW50ZXJcblx0XHQjIEBuYXRpdmUgID0gZmFsc2Vcblx0XHRzZWxmLmV2ZW50ID0gZXZlbnRcblx0XHRkYXRhID0ge31cblx0XHRhY3RpdmUgPSB5ZXNcblx0XHRAYnV0dG9uID0gZXZlbnQgYW5kIGV2ZW50OmJ1dHRvbiBvciAwXG5cdFx0QHN1cHByZXNzID0gbm8gIyBkZXByZWNhdGVkXG5cdFx0QGNhcHR1cmVkID0gbm9cblx0XHRidWJibGUgPSBub1xuXHRcdHBvaW50ZXIgPSBwb2ludGVyXG5cdFx0dXBkYXRlcyA9IDBcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjYXB0dXJlXG5cdFx0QGNhcHR1cmVkID0geWVzXG5cdFx0QGV2ZW50IGFuZCBAZXZlbnQuc3RvcFByb3BhZ2F0aW9uXG5cdFx0dW5sZXNzIEBzZWxibG9ja2VyXG5cdFx0XHRAc2VsYmxvY2tlciA9IGRvIHxlfCBlLnByZXZlbnREZWZhdWx0XG5cdFx0XHRJbWJhLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JyxAc2VsYmxvY2tlcix5ZXMpXG5cdFx0c2VsZlxuXG5cdGRlZiBpc0NhcHR1cmVkXG5cdFx0ISFAY2FwdHVyZWRcblxuXHQjIyNcblx0RXh0ZW5kIHRoZSB0b3VjaCB3aXRoIGEgcGx1Z2luIC8gZ2VzdHVyZS4gXG5cdEFsbCBldmVudHMgKHRvdWNoc3RhcnQsbW92ZSBldGMpIGZvciB0aGUgdG91Y2hcblx0d2lsbCBiZSB0cmlnZ2VyZWQgb24gdGhlIHBsdWdpbnMgaW4gdGhlIG9yZGVyIHRoZXlcblx0YXJlIGFkZGVkLlxuXHQjIyNcblx0ZGVmIGV4dGVuZCBwbHVnaW5cblx0XHQjIGNvbnNvbGUubG9nIFwiYWRkZWQgZ2VzdHVyZSEhIVwiXG5cdFx0QGdlc3R1cmVzIHx8PSBbXVxuXHRcdEBnZXN0dXJlcy5wdXNoKHBsdWdpbilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJlZGlyZWN0IHRvdWNoIHRvIHNwZWNpZmllZCB0YXJnZXQuIG9udG91Y2hzdGFydCB3aWxsIGFsd2F5cyBiZVxuXHRjYWxsZWQgb24gdGhlIG5ldyB0YXJnZXQuXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiByZWRpcmVjdCB0YXJnZXRcblx0XHRAcmVkaXJlY3QgPSB0YXJnZXRcblx0XHRzZWxmXG5cblx0IyMjXG5cdFN1cHByZXNzIHRoZSBkZWZhdWx0IGJlaGF2aW91ci4gV2lsbCBjYWxsIHByZXZlbnREZWZhdWx0IGZvclxuXHRhbGwgbmF0aXZlIGV2ZW50cyB0aGF0IGFyZSBwYXJ0IG9mIHRoZSB0b3VjaC5cblx0IyMjXG5cdGRlZiBzdXBwcmVzc1xuXHRcdCMgY29sbGlzaW9uIHdpdGggdGhlIHN1cHByZXNzIHByb3BlcnR5XG5cdFx0QGFjdGl2ZSA9IG5vXG5cdFx0XG5cdFx0c2VsZlxuXG5cdGRlZiBzdXBwcmVzcz0gdmFsdWVcblx0XHRjb25zb2xlLndhcm4gJ0ltYmEuVG91Y2gjc3VwcHJlc3M9IGlzIGRlcHJlY2F0ZWQnXG5cdFx0QHN1cHJlc3MgPSB2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hzdGFydCBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHRvdWNoID0gdFxuXHRcdEBidXR0b24gPSAwXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGJlZ2FuXG5cdFx0dXBkYXRlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaG1vdmUgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHR1cGRhdGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoZW5kIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0ZW5kZWRcblxuXHRcdEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCA9IGU6dGltZVN0YW1wXG5cblx0XHRpZiBAbWF4ZHIgPCAyMFxuXHRcdFx0dmFyIHRhcCA9IEltYmEuRXZlbnQubmV3KGUpXG5cdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHR0YXAucHJvY2Vzc1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiB0YXAuQHJlc3BvbmRlclx0XG5cblx0XHRpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0XG5cblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoY2FuY2VsIGUsdFxuXHRcdGNhbmNlbFxuXG5cdGRlZiBtb3VzZWRvd24gZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEBidXR0b24gPSBlOmJ1dHRvblxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRiZWdhblxuXHRcdHVwZGF0ZVxuXHRcdEBtb3VzZW1vdmUgPSAofGV8IG1vdXNlbW92ZShlLGUpIClcblx0XHRJbWJhLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsQG1vdXNlbW92ZSx5ZXMpXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZW1vdmUgZSx0XG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdEBldmVudCA9IGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGlzQ2FwdHVyZWRcblx0XHR1cGRhdGVcblx0XHRtb3ZlXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZXVwIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRlbmRlZFxuXHRcdHNlbGZcblxuXHRkZWYgaWRsZVxuXHRcdHVwZGF0ZVxuXG5cdGRlZiBiZWdhblxuXHRcdEB0aW1lc3RhbXAgPSBEYXRlLm5vd1xuXHRcdEBtYXhkciA9IEBkciA9IDBcblx0XHRAeDAgPSBAeFxuXHRcdEB5MCA9IEB5XG5cblx0XHR2YXIgZG9tID0gZXZlbnQ6dGFyZ2V0XG5cdFx0dmFyIG5vZGUgPSBudWxsXG5cblx0XHRAc291cmNlVGFyZ2V0ID0gZG9tIGFuZCB0YWcoZG9tKVxuXG5cdFx0d2hpbGUgZG9tXG5cdFx0XHRub2RlID0gdGFnKGRvbSlcblx0XHRcdGlmIG5vZGUgJiYgbm9kZTpvbnRvdWNoc3RhcnRcblx0XHRcdFx0QGJ1YmJsZSA9IG5vXG5cdFx0XHRcdHRhcmdldCA9IG5vZGVcblx0XHRcdFx0dGFyZ2V0Lm9udG91Y2hzdGFydChzZWxmKVxuXHRcdFx0XHRicmVhayB1bmxlc3MgQGJ1YmJsZVxuXHRcdFx0ZG9tID0gZG9tOnBhcmVudE5vZGVcblxuXHRcdEB1cGRhdGVzKytcblx0XHRzZWxmXG5cblx0ZGVmIHVwZGF0ZVxuXHRcdHJldHVybiBzZWxmIGlmICFAYWN0aXZlIG9yIEBjYW5jZWxsZWRcblxuXHRcdHZhciBkciA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxuXHRcdEBtYXhkciA9IGRyIGlmIGRyID4gQGRyXG5cdFx0QGRyID0gZHJcblxuXHRcdCMgY2F0Y2hpbmcgYSB0b3VjaC1yZWRpcmVjdD8hP1xuXHRcdGlmIEByZWRpcmVjdFxuXHRcdFx0aWYgQHRhcmdldCBhbmQgQHRhcmdldDpvbnRvdWNoY2FuY2VsXG5cdFx0XHRcdEB0YXJnZXQub250b3VjaGNhbmNlbChzZWxmKVxuXHRcdFx0dGFyZ2V0ID0gQHJlZGlyZWN0XG5cdFx0XHRAcmVkaXJlY3QgPSBudWxsXG5cdFx0XHR0YXJnZXQub250b3VjaHN0YXJ0KHNlbGYpIGlmIHRhcmdldDpvbnRvdWNoc3RhcnRcblx0XHRcdHJldHVybiB1cGRhdGUgaWYgQHJlZGlyZWN0ICMgcG9zc2libHkgcmVkaXJlY3RpbmcgYWdhaW5cblxuXG5cdFx0QHVwZGF0ZXMrK1xuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zy5vbnRvdWNodXBkYXRlKHNlbGYpIGZvciBnIGluIEBnZXN0dXJlc1xuXG5cdFx0dGFyZ2V0Py5vbnRvdWNodXBkYXRlKHNlbGYpXG5cdFx0dXBkYXRlIGlmIEByZWRpcmVjdFxuXHRcdHNlbGZcblxuXHRkZWYgbW92ZVxuXHRcdHJldHVybiBzZWxmIGlmICFAYWN0aXZlIG9yIEBjYW5jZWxsZWRcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zm9yIGcgaW4gQGdlc3R1cmVzXG5cdFx0XHRcdGcub250b3VjaG1vdmUoc2VsZixAZXZlbnQpIGlmIGc6b250b3VjaG1vdmVcblxuXHRcdHRhcmdldD8ub250b3VjaG1vdmUoc2VsZixAZXZlbnQpXG5cdFx0c2VsZlxuXG5cdGRlZiBlbmRlZFxuXHRcdHJldHVybiBzZWxmIGlmICFAYWN0aXZlIG9yIEBjYW5jZWxsZWRcblxuXHRcdEB1cGRhdGVzKytcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zy5vbnRvdWNoZW5kKHNlbGYpIGZvciBnIGluIEBnZXN0dXJlc1xuXG5cdFx0dGFyZ2V0Py5vbnRvdWNoZW5kKHNlbGYpXG5cdFx0Y2xlYW51cF9cblx0XHRzZWxmXG5cblx0ZGVmIGNhbmNlbFxuXHRcdHVubGVzcyBAY2FuY2VsbGVkXG5cdFx0XHRAY2FuY2VsbGVkID0geWVzXG5cdFx0XHRjYW5jZWxsZWRcblx0XHRcdGNsZWFudXBfXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxsZWRcblx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgQGFjdGl2ZVxuXG5cdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdEB1cGRhdGVzKytcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zm9yIGcgaW4gQGdlc3R1cmVzXG5cdFx0XHRcdGcub250b3VjaGNhbmNlbChzZWxmKSBpZiBnOm9udG91Y2hjYW5jZWxcblxuXHRcdHRhcmdldD8ub250b3VjaGNhbmNlbChzZWxmKVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIGNsZWFudXBfXG5cdFx0aWYgQG1vdXNlbW92ZVxuXHRcdFx0SW1iYS5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdFx0QG1vdXNlbW92ZSA9IG51bGxcblx0XHRcblx0XHRpZiBAc2VsYmxvY2tlclxuXHRcdFx0SW1iYS5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsQHNlbGJsb2NrZXIseWVzKVxuXHRcdFx0QHNlbGJsb2NrZXIgPSBudWxsXG5cdFx0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRUaGUgYWJzb2x1dGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCBmcm9tIHN0YXJ0aW5nIHBvc2l0aW9uIFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHIgZG8gQGRyXG5cblx0IyMjXG5cdFRoZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIGhvcml6b250YWxseVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHggZG8gQHggLSBAeDBcblxuXHQjIyNcblx0VGhlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgdmVydGljYWxseVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHkgZG8gQHkgLSBAeTBcblxuXHQjIyNcblx0SW5pdGlhbCBob3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB4MCBkbyBAeDBcblxuXHQjIyNcblx0SW5pdGlhbCB2ZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeTAgZG8gQHkwXG5cblx0IyMjXG5cdEhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHggZG8gQHhcblxuXHQjIyNcblx0VmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHkgZG8gQHlcblxuXHQjIyNcblx0SG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaCByZWxhdGl2ZSB0byB0YXJnZXRcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHR4IGRvXG5cdFx0QHRhcmdldEJveCB8fD0gQHRhcmdldC5kb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cdFx0QHggLSBAdGFyZ2V0Qm94OmxlZnRcblxuXHQjIyNcblx0VmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2ggcmVsYXRpdmUgdG8gdGFyZ2V0XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB0eVxuXHRcdEB0YXJnZXRCb3ggfHw9IEB0YXJnZXQuZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXHRcdEB5IC0gQHRhcmdldEJveDp0b3BcblxuXHQjIyNcblx0QnV0dG9uIHByZXNzZWQgaW4gdGhpcyB0b3VjaC4gTmF0aXZlIHRvdWNoZXMgZGVmYXVsdHMgdG8gbGVmdC1jbGljayAoMClcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGJ1dHRvbiBkbyBAYnV0dG9uICMgQHBvaW50ZXIgPyBAcG9pbnRlci5idXR0b24gOiAwXG5cblx0ZGVmIHNvdXJjZVRhcmdldFxuXHRcdEBzb3VyY2VUYXJnZXRcblxuXHRkZWYgZWxhcHNlZFxuXHRcdERhdGUubm93IC0gQHRpbWVzdGFtcFxuXG5cbmNsYXNzIEltYmEuVG91Y2hHZXN0dXJlXG5cblx0cHJvcCBhY3RpdmUgZGVmYXVsdDogbm9cblxuXHRkZWYgb250b3VjaHN0YXJ0IGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2h1cGRhdGUgZVxuXHRcdHNlbGZcblxuXHRkZWYgb250b3VjaGVuZCBlXG5cdFx0c2VsZlxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vdG91Y2guaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxudmFyIGtleUNvZGVzID0ge1xuXHRlc2M6IDI3LFxuXHR0YWI6IDksXG5cdGVudGVyOiAxMyxcblx0c3BhY2U6IDMyLFxuXHR1cDogMzgsXG5cdGRvd246IDQwXG59XG5cbnZhciBlbCA9IEltYmEuVGFnOnByb3RvdHlwZVxuZGVmIGVsLnN0b3BNb2RpZmllciBlIGRvIGUuc3RvcCB8fCB0cnVlXG5kZWYgZWwucHJldmVudE1vZGlmaWVyIGUgZG8gZS5wcmV2ZW50IHx8IHRydWVcbmRlZiBlbC5zaWxlbmNlTW9kaWZpZXIgZSBkbyBlLnNpbGVuY2UgfHwgdHJ1ZVxuZGVmIGVsLmJ1YmJsZU1vZGlmaWVyIGUgZG8gZS5idWJibGUoeWVzKSB8fCB0cnVlXG5kZWYgZWwuY3RybE1vZGlmaWVyIGUgZG8gZS5ldmVudDpjdHJsS2V5ID09IHRydWVcbmRlZiBlbC5hbHRNb2RpZmllciBlIGRvIGUuZXZlbnQ6YWx0S2V5ID09IHRydWVcbmRlZiBlbC5zaGlmdE1vZGlmaWVyIGUgZG8gZS5ldmVudDpzaGlmdEtleSA9PSB0cnVlXG5kZWYgZWwubWV0YU1vZGlmaWVyIGUgZG8gZS5ldmVudDptZXRhS2V5ID09IHRydWVcbmRlZiBlbC5rZXlNb2RpZmllciBrZXksIGUgZG8gZS5rZXlDb2RlID8gKGUua2V5Q29kZSA9PSBrZXkpIDogdHJ1ZVxuZGVmIGVsLmRlbE1vZGlmaWVyIGUgZG8gZS5rZXlDb2RlID8gKGUua2V5Q29kZSA9PSA4IG9yIGUua2V5Q29kZSA9PSA0NikgOiB0cnVlXG5kZWYgZWwuc2VsZk1vZGlmaWVyIGUgZG8gZS5ldmVudDp0YXJnZXQgPT0gQGRvbVxuZGVmIGVsLmxlZnRNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMCkgOiBlbC5rZXlNb2RpZmllcigzNyxlKVxuZGVmIGVsLnJpZ2h0TW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDIpIDogZWwua2V5TW9kaWZpZXIoMzksZSlcbmRlZiBlbC5taWRkbGVNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMSkgOiB0cnVlXG5cdFxuZGVmIGVsLmdldEhhbmRsZXIgc3RyLCBldmVudFxuXHRyZXR1cm4gc2VsZiBpZiBzZWxmW3N0cl1cblxuIyMjXG5JbWJhIGhhbmRsZXMgYWxsIGV2ZW50cyBpbiB0aGUgZG9tIHRocm91Z2ggYSBzaW5nbGUgbWFuYWdlcixcbmxpc3RlbmluZyBhdCB0aGUgcm9vdCBvZiB5b3VyIGRvY3VtZW50LiBJZiBJbWJhIGZpbmRzIGEgdGFnXG50aGF0IGxpc3RlbnMgdG8gYSBjZXJ0YWluIGV2ZW50LCB0aGUgZXZlbnQgd2lsbCBiZSB3cmFwcGVkIFxuaW4gYW4gYEltYmEuRXZlbnRgLCB3aGljaCBub3JtYWxpemVzIHNvbWUgb2YgdGhlIHF1aXJrcyBhbmQgXG5icm93c2VyIGRpZmZlcmVuY2VzLlxuXG5AaW5hbWUgZXZlbnRcbiMjI1xuY2xhc3MgSW1iYS5FdmVudFxuXG5cdCMjIyByZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBldmVudCAjIyNcblx0cHJvcCBldmVudFxuXG5cdCMjIyByZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBldmVudCAjIyNcblx0cHJvcCBwcmVmaXhcblxuXHRwcm9wIGRhdGFcblxuXHRwcm9wIHJlc3BvbmRlclxuXG5cdGRlZiBzZWxmLndyYXAgZVxuXHRcdHNlbGYubmV3KGUpXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZSBlXG5cdFx0ZXZlbnQgPSBlXG5cdFx0QGJ1YmJsZSA9IHllc1xuXG5cdGRlZiB0eXBlPSB0eXBlXG5cdFx0QHR5cGUgPSB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRAcmV0dXJuIHtTdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBldmVudCAoY2FzZS1pbnNlbnNpdGl2ZSlcblx0IyMjXG5cdGRlZiB0eXBlXG5cdFx0QHR5cGUgfHwgZXZlbnQ6dHlwZVxuXHRcblx0ZGVmIGJ1dHRvbiBkbyBldmVudDpidXR0b25cblx0ZGVmIGtleUNvZGUgZG8gZXZlbnQ6a2V5Q29kZVxuXG5cdGRlZiBuYW1lXG5cdFx0QG5hbWUgfHw9IHR5cGUudG9Mb3dlckNhc2UucmVwbGFjZSgvXFw6L2csJycpXG5cblx0IyBtaW1jIGdldHNldFxuXHRkZWYgYnViYmxlIHZcblx0XHRpZiB2ICE9IHVuZGVmaW5lZFxuXHRcdFx0c2VsZi5idWJibGUgPSB2XG5cdFx0XHRyZXR1cm4gc2VsZlxuXHRcdHJldHVybiBAYnViYmxlXG5cblx0ZGVmIGJ1YmJsZT0gdlxuXHRcdEBidWJibGUgPSB2XG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0UHJldmVudHMgZnVydGhlciBwcm9wYWdhdGlvbiBvZiB0aGUgY3VycmVudCBldmVudC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzdG9wXG5cdFx0YnViYmxlID0gbm9cblx0XHRzZWxmXG5cblx0ZGVmIHN0b3BQcm9wYWdhdGlvbiBkbyBzdG9wXG5cdGRlZiBoYWx0IGRvIHN0b3BcblxuXHQjIG1pZ3JhdGUgZnJvbSBjYW5jZWwgdG8gcHJldmVudFxuXHRkZWYgcHJldmVudFxuXHRcdGlmIGV2ZW50OnByZXZlbnREZWZhdWx0XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdFxuXHRcdGVsc2Vcblx0XHRcdGV2ZW50OmRlZmF1bHRQcmV2ZW50ZWQgPSB5ZXNcblx0XHRzZWxmOmRlZmF1bHRQcmV2ZW50ZWQgPSB5ZXNcblx0XHRzZWxmXG5cblx0ZGVmIHByZXZlbnREZWZhdWx0XG5cdFx0Y29uc29sZS53YXJuIFwiRXZlbnQjcHJldmVudERlZmF1bHQgaXMgZGVwcmVjYXRlZCAtIHVzZSBFdmVudCNwcmV2ZW50XCJcblx0XHRwcmV2ZW50XG5cblx0IyMjXG5cdEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCBldmVudC5jYW5jZWwgaGFzIGJlZW4gY2FsbGVkLlxuXG5cdEByZXR1cm4ge0Jvb2xlYW59XG5cdCMjI1xuXHRkZWYgaXNQcmV2ZW50ZWRcblx0XHRldmVudCBhbmQgZXZlbnQ6ZGVmYXVsdFByZXZlbnRlZCBvciBAY2FuY2VsXG5cblx0IyMjXG5cdENhbmNlbCB0aGUgZXZlbnQgKGlmIGNhbmNlbGFibGUpLiBJbiB0aGUgY2FzZSBvZiBuYXRpdmUgZXZlbnRzIGl0XG5cdHdpbGwgY2FsbCBgcHJldmVudERlZmF1bHRgIG9uIHRoZSB3cmFwcGVkIGV2ZW50IG9iamVjdC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjYW5jZWxcblx0XHRjb25zb2xlLndhcm4gXCJFdmVudCNjYW5jZWwgaXMgZGVwcmVjYXRlZCAtIHVzZSBFdmVudCNwcmV2ZW50XCJcblx0XHRwcmV2ZW50XG5cblx0ZGVmIHNpbGVuY2Vcblx0XHRAc2lsZW5jZWQgPSB5ZXNcblx0XHRzZWxmXG5cblx0ZGVmIGlzU2lsZW5jZWRcblx0XHQhIUBzaWxlbmNlZFxuXG5cdCMjI1xuXHRBIHJlZmVyZW5jZSB0byB0aGUgaW5pdGlhbCB0YXJnZXQgb2YgdGhlIGV2ZW50LlxuXHQjIyNcblx0ZGVmIHRhcmdldFxuXHRcdHRhZyhldmVudDpfdGFyZ2V0IG9yIGV2ZW50OnRhcmdldClcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIG9iamVjdCByZXNwb25kaW5nIHRvIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiByZXNwb25kZXJcblx0XHRAcmVzcG9uZGVyXG5cblx0IyMjXG5cdFJlZGlyZWN0IHRoZSBldmVudCB0byBuZXcgdGFyZ2V0XG5cdCMjI1xuXHRkZWYgcmVkaXJlY3Qgbm9kZVxuXHRcdEByZWRpcmVjdCA9IG5vZGVcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBwcm9jZXNzSGFuZGxlcnMgbm9kZSwgaGFuZGxlcnNcblx0XHRsZXQgaSA9IDFcblx0XHRsZXQgbCA9IGhhbmRsZXJzOmxlbmd0aFxuXHRcdGxldCBidWJibGUgPSBAYnViYmxlXG5cdFx0bGV0IHN0YXRlID0gaGFuZGxlcnM6c3RhdGUgfHw9IHt9XG5cdFx0bGV0IHJlc3VsdCBcblx0XHRcblx0XHRpZiBidWJibGVcblx0XHRcdEBidWJibGUgPSAxXG5cblx0XHR3aGlsZSBpIDwgbFxuXHRcdFx0bGV0IGlzTW9kID0gZmFsc2Vcblx0XHRcdGxldCBoYW5kbGVyID0gaGFuZGxlcnNbaSsrXVxuXHRcdFx0bGV0IHBhcmFtcyAgPSBudWxsXG5cdFx0XHRsZXQgY29udGV4dCA9IG5vZGVcblx0XHRcdFxuXHRcdFx0aWYgaGFuZGxlciBpc2EgQXJyYXlcblx0XHRcdFx0cGFyYW1zID0gaGFuZGxlci5zbGljZSgxKVxuXHRcdFx0XHRoYW5kbGVyID0gaGFuZGxlclswXVxuXHRcdFx0XG5cdFx0XHRpZiB0eXBlb2YgaGFuZGxlciA9PSAnc3RyaW5nJ1xuXHRcdFx0XHRpZiBrZXlDb2Rlc1toYW5kbGVyXVxuXHRcdFx0XHRcdHBhcmFtcyA9IFtrZXlDb2Rlc1toYW5kbGVyXV1cblx0XHRcdFx0XHRoYW5kbGVyID0gJ2tleSdcblx0XHRcdFx0XHRcblx0XHRcdFx0bGV0IG1vZCA9IGhhbmRsZXIgKyAnTW9kaWZpZXInXG5cblx0XHRcdFx0aWYgbm9kZVttb2RdXG5cdFx0XHRcdFx0aXNNb2QgPSB5ZXNcblx0XHRcdFx0XHRwYXJhbXMgPSAocGFyYW1zIG9yIFtdKS5jb25jYXQoW3NlbGYsc3RhdGVdKVxuXHRcdFx0XHRcdGhhbmRsZXIgPSBub2RlW21vZF1cblx0XHRcdFxuXHRcdFx0IyBpZiBpdCBpcyBzdGlsbCBhIHN0cmluZyAtIGNhbGwgZ2V0SGFuZGxlciBvblxuXHRcdFx0IyBhbmNlc3RvciBvZiBub2RlIHRvIHNlZSBpZiB3ZSBnZXQgYSBoYW5kbGVyIGZvciB0aGlzIG5hbWVcblx0XHRcdGlmIHR5cGVvZiBoYW5kbGVyID09ICdzdHJpbmcnXG5cdFx0XHRcdGxldCBlbCA9IG5vZGVcblx0XHRcdFx0bGV0IGZuID0gbnVsbFxuXHRcdFx0XHRsZXQgY3R4ID0gc3RhdGU6Y29udGV4dFxuXHRcblx0XHRcdFx0aWYgY3R4XG5cdFx0XHRcdFx0aWYgY3R4OmdldEhhbmRsZXIgaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRjdHggPSBjdHguZ2V0SGFuZGxlcihoYW5kbGVyLHNlbGYpXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgY3R4W2hhbmRsZXJdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdFx0aGFuZGxlciA9IGZuID0gY3R4W2hhbmRsZXJdXG5cdFx0XHRcdFx0XHRjb250ZXh0ID0gY3R4XG5cblx0XHRcdFx0dW5sZXNzIGZuXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuIFwiZXZlbnQge3R5cGV9OiBjb3VsZCBub3QgZmluZCAne2hhbmRsZXJ9JyBpbiBjb250ZXh0XCIsY3R4XG5cblx0XHRcdFx0IyB3aGlsZSBlbCBhbmQgKCFmbiBvciAhKGZuIGlzYSBGdW5jdGlvbikpXG5cdFx0XHRcdCMgXHRpZiBmbiA9IGVsLmdldEhhbmRsZXIoaGFuZGxlcilcblx0XHRcdFx0IyBcdFx0aWYgZm5baGFuZGxlcl0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdCMgXHRcdFx0aGFuZGxlciA9IGZuW2hhbmRsZXJdXG5cdFx0XHRcdCMgXHRcdFx0Y29udGV4dCA9IGZuXG5cdFx0XHRcdCMgXHRcdGVsaWYgZm4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdCMgXHRcdFx0aGFuZGxlciA9IGZuXG5cdFx0XHRcdCMgXHRcdFx0Y29udGV4dCA9IGVsXG5cdFx0XHRcdCMgXHRlbHNlXG5cdFx0XHRcdCMgXHRcdGVsID0gZWwucGFyZW50XG5cdFx0XHRcdFx0XG5cdFx0XHRpZiBoYW5kbGVyIGlzYSBGdW5jdGlvblxuXHRcdFx0XHQjIHdoYXQgaWYgd2UgYWN0dWFsbHkgY2FsbCBzdG9wIGluc2lkZSBmdW5jdGlvbj9cblx0XHRcdFx0IyBkbyB3ZSBzdGlsbCB3YW50IHRvIGNvbnRpbnVlIHRoZSBjaGFpbj9cblx0XHRcdFx0bGV0IHJlcyA9IGhhbmRsZXIuYXBwbHkoY29udGV4dCxwYXJhbXMgb3IgW3NlbGZdKVxuXG5cdFx0XHRcdGlmICFpc01vZFxuXHRcdFx0XHRcdEByZXNwb25kZXIgfHw9IG5vZGVcblxuXHRcdFx0XHRpZiByZXMgPT0gZmFsc2Vcblx0XHRcdFx0XHQjIGNvbnNvbGUubG9nIFwicmV0dXJuZWQgZmFsc2UgLSBicmVha2luZ1wiXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRpZiByZXMgYW5kICFAc2lsZW5jZWQgYW5kIHJlczp0aGVuIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdHJlcy50aGVuKEltYmE6Y29tbWl0KVxuXHRcdFxuXHRcdCMgaWYgd2UgaGF2ZW50IHN0b3BwZWQgb3IgZGVhbHQgd2l0aCBidWJibGUgd2hpbGUgaGFuZGxpbmdcblx0XHRpZiBAYnViYmxlID09PSAxXG5cdFx0XHRAYnViYmxlID0gYnViYmxlXG5cblx0XHRyZXR1cm4gbnVsbFxuXG5cdGRlZiBwcm9jZXNzXG5cdFx0dmFyIG5hbWUgPSBzZWxmLm5hbWVcblx0XHR2YXIgbWV0aCA9IFwib257QHByZWZpeCBvciAnJ317bmFtZX1cIlxuXHRcdHZhciBhcmdzID0gbnVsbFxuXHRcdHZhciBkb210YXJnZXQgPSBldmVudDpfdGFyZ2V0IG9yIGV2ZW50OnRhcmdldFx0XHRcblx0XHR2YXIgZG9tbm9kZSA9IGRvbXRhcmdldDpfcmVzcG9uZGVyIG9yIGRvbXRhcmdldFxuXHRcdCMgQHRvZG8gbmVlZCB0byBzdG9wIGluZmluaXRlIHJlZGlyZWN0LXJ1bGVzIGhlcmVcblx0XHR2YXIgcmVzdWx0XG5cdFx0dmFyIGhhbmRsZXJzXG5cblx0XHR3aGlsZSBkb21ub2RlXG5cdFx0XHRAcmVkaXJlY3QgPSBudWxsXG5cdFx0XHRsZXQgbm9kZSA9IGRvbW5vZGUuQGRvbSA/IGRvbW5vZGUgOiBkb21ub2RlLkB0YWdcblxuXHRcdFx0aWYgbm9kZVxuXHRcdFx0XHRpZiBoYW5kbGVycyA9IG5vZGU6X29uX1xuXHRcdFx0XHRcdGZvciBoYW5kbGVyIGluIGhhbmRsZXJzIHdoZW4gaGFuZGxlclxuXHRcdFx0XHRcdFx0bGV0IGhuYW1lID0gaGFuZGxlclswXVxuXHRcdFx0XHRcdFx0aWYgbmFtZSA9PSBoYW5kbGVyWzBdIGFuZCBidWJibGVcblx0XHRcdFx0XHRcdFx0cHJvY2Vzc0hhbmRsZXJzKG5vZGUsaGFuZGxlcilcblx0XHRcdFx0XHRicmVhayB1bmxlc3MgYnViYmxlXG5cblx0XHRcdFx0aWYgYnViYmxlIGFuZCBub2RlW21ldGhdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdEByZXNwb25kZXIgfHw9IG5vZGVcblx0XHRcdFx0XHRAc2lsZW5jZWQgPSBub1xuXHRcdFx0XHRcdHJlc3VsdCA9IGFyZ3MgPyBub2RlW21ldGhdLmFwcGx5KG5vZGUsYXJncykgOiBub2RlW21ldGhdKHNlbGYsZGF0YSlcblxuXHRcdFx0XHRpZiBub2RlOm9uZXZlbnRcblx0XHRcdFx0XHRub2RlLm9uZXZlbnQoc2VsZilcblxuXHRcdFx0IyBhZGQgbm9kZS5uZXh0RXZlbnRSZXNwb25kZXIgYXMgYSBzZXBhcmF0ZSBtZXRob2QgaGVyZT9cblx0XHRcdHVubGVzcyBidWJibGUgYW5kIGRvbW5vZGUgPSAoQHJlZGlyZWN0IG9yIChub2RlID8gbm9kZS5wYXJlbnQgOiBkb21ub2RlOnBhcmVudE5vZGUpKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0cHJvY2Vzc2VkXG5cblx0XHQjIGlmIGEgaGFuZGxlciByZXR1cm5zIGEgcHJvbWlzZSwgbm90aWZ5IHNjaGVkdWxlcnNcblx0XHQjIGFib3V0IHRoaXMgYWZ0ZXIgcHJvbWlzZSBoYXMgZmluaXNoZWQgcHJvY2Vzc2luZ1xuXHRcdGlmIHJlc3VsdCBhbmQgcmVzdWx0OnRoZW4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRyZXN1bHQudGhlbihzZWxmOnByb2Nlc3NlZC5iaW5kKHNlbGYpKVxuXHRcdHJldHVybiBzZWxmXG5cblxuXHRkZWYgcHJvY2Vzc2VkXG5cdFx0aWYgIUBzaWxlbmNlZCBhbmQgQHJlc3BvbmRlclxuXHRcdFx0SW1iYS5lbWl0KEltYmEsJ2V2ZW50Jyxbc2VsZl0pXG5cdFx0XHRJbWJhLmNvbW1pdChldmVudClcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJldHVybiB0aGUgeC9sZWZ0IGNvb3JkaW5hdGUgb2YgdGhlIG1vdXNlIC8gcG9pbnRlciBmb3IgdGhpcyBldmVudFxuXHRAcmV0dXJuIHtOdW1iZXJ9IHggY29vcmRpbmF0ZSBvZiBtb3VzZSAvIHBvaW50ZXIgZm9yIGV2ZW50XG5cdCMjI1xuXHRkZWYgeCBkbyBldmVudDp4XG5cblx0IyMjXG5cdFJldHVybiB0aGUgeS90b3AgY29vcmRpbmF0ZSBvZiB0aGUgbW91c2UgLyBwb2ludGVyIGZvciB0aGlzIGV2ZW50XG5cdEByZXR1cm4ge051bWJlcn0geSBjb29yZGluYXRlIG9mIG1vdXNlIC8gcG9pbnRlciBmb3IgZXZlbnRcblx0IyMjXG5cdGRlZiB5IGRvIGV2ZW50OnlcblxuXHQjIyNcblx0UmV0dXJucyBhIE51bWJlciByZXByZXNlbnRpbmcgYSBzeXN0ZW0gYW5kIGltcGxlbWVudGF0aW9uXG5cdGRlcGVuZGVudCBudW1lcmljIGNvZGUgaWRlbnRpZnlpbmcgdGhlIHVubW9kaWZpZWQgdmFsdWUgb2YgdGhlXG5cdHByZXNzZWQga2V5OyB0aGlzIGlzIHVzdWFsbHkgdGhlIHNhbWUgYXMga2V5Q29kZS5cblxuXHRGb3IgbW91c2UtZXZlbnRzLCB0aGUgcmV0dXJuZWQgdmFsdWUgaW5kaWNhdGVzIHdoaWNoIGJ1dHRvbiB3YXNcblx0cHJlc3NlZCBvbiB0aGUgbW91c2UgdG8gdHJpZ2dlciB0aGUgZXZlbnQuXG5cblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHdoaWNoIGRvIGV2ZW50OndoaWNoXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxucmVxdWlyZShcIi4vcG9pbnRlclwiKVxuXG4jIyNcblxuTWFuYWdlciBmb3IgbGlzdGVuaW5nIHRvIGFuZCBkZWxlZ2F0aW5nIGV2ZW50cyBpbiBJbWJhLiBBIHNpbmdsZSBpbnN0YW5jZVxuaXMgYWx3YXlzIGNyZWF0ZWQgYnkgSW1iYSAoYXMgYEltYmEuRXZlbnRzYCksIHdoaWNoIGhhbmRsZXMgYW5kIGRlbGVnYXRlcyBhbGxcbmV2ZW50cyBhdCB0aGUgdmVyeSByb290IG9mIHRoZSBkb2N1bWVudC4gSW1iYSBkb2VzIG5vdCBjYXB0dXJlIGFsbCBldmVudHNcbmJ5IGRlZmF1bHQsIHNvIGlmIHlvdSB3YW50IHRvIG1ha2Ugc3VyZSBleG90aWMgb3IgY3VzdG9tIERPTUV2ZW50cyBhcmUgZGVsZWdhdGVkXG5pbiBJbWJhIHlvdSB3aWxsIG5lZWQgdG8gcmVnaXN0ZXIgdGhlbSBpbiBgSW1iYS5FdmVudHMucmVnaXN0ZXIobXlDdXN0b21FdmVudE5hbWUpYFxuXG5AaW5hbWUgbWFuYWdlclxuXG4jIyNcbmNsYXNzIEltYmEuRXZlbnRNYW5hZ2VyXG5cblx0cHJvcCByb290XG5cdHByb3AgY291bnRcblx0cHJvcCBlbmFibGVkIGRlZmF1bHQ6IG5vLCB3YXRjaDogeWVzXG5cdHByb3AgbGlzdGVuZXJzXG5cdHByb3AgZGVsZWdhdG9yc1xuXHRwcm9wIGRlbGVnYXRvclxuXG5cdGRlZiBlbmFibGVkLWRpZC1zZXQgYm9vbFxuXHRcdGJvb2wgPyBvbmVuYWJsZSA6IG9uZGlzYWJsZVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5hY3RpdmF0ZVxuXHRcdHJldHVybiBJbWJhLkV2ZW50cyBpZiBJbWJhLkV2ZW50c1xuXG5cdFx0aWYgJHdlYiRcblx0XHRcdEltYmEuUE9JTlRFUiB8fD0gSW1iYS5Qb2ludGVyLm5ld1xuXG5cdFx0XHRJbWJhLkV2ZW50cyA9IEltYmEuRXZlbnRNYW5hZ2VyLm5ldyhJbWJhLmRvY3VtZW50LCBldmVudHM6IFtcblx0XHRcdFx0OmtleWRvd24sIDprZXl1cCwgOmtleXByZXNzLFxuXHRcdFx0XHQ6dGV4dElucHV0LCA6aW5wdXQsIDpjaGFuZ2UsIDpzdWJtaXQsXG5cdFx0XHRcdDpmb2N1c2luLCA6Zm9jdXNvdXQsIDpmb2N1cywgOmJsdXIsXG5cdFx0XHRcdDpjb250ZXh0bWVudSwgOmRibGNsaWNrLFxuXHRcdFx0XHQ6bW91c2V3aGVlbCwgOndoZWVsLCA6c2Nyb2xsLFxuXHRcdFx0XHQ6YmVmb3JlY29weSwgOmNvcHksXG5cdFx0XHRcdDpiZWZvcmVwYXN0ZSwgOnBhc3RlLFxuXHRcdFx0XHQ6YmVmb3JlY3V0LCA6Y3V0XG5cdFx0XHRdKVxuXG5cdFx0XHQjIHNob3VsZCBsaXN0ZW4gdG8gZHJhZ2Ryb3AgZXZlbnRzIGJ5IGRlZmF1bHRcblx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKFtcblx0XHRcdFx0OmRyYWdzdGFydCw6ZHJhZyw6ZHJhZ2VuZCxcblx0XHRcdFx0OmRyYWdlbnRlciw6ZHJhZ292ZXIsOmRyYWdsZWF2ZSw6ZHJhZ2V4aXQsOmRyb3Bcblx0XHRcdF0pXG5cblx0XHRcdHZhciBoYXNUb3VjaEV2ZW50cyA9IHdpbmRvdyAmJiB3aW5kb3c6b250b3VjaHN0YXJ0ICE9PSB1bmRlZmluZWRcblxuXHRcdFx0aWYgaGFzVG91Y2hFdmVudHNcblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaHN0YXJ0KSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hzdGFydChlKVxuXG5cdFx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2htb3ZlKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2htb3ZlKGUpXG5cblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaGVuZCkgZG8gfGV8XG5cdFx0XHRcdFx0SW1iYS5Ub3VjaC5vbnRvdWNoZW5kKGUpXG5cblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaGNhbmNlbCkgZG8gfGV8XG5cdFx0XHRcdFx0SW1iYS5Ub3VjaC5vbnRvdWNoY2FuY2VsKGUpXG5cblx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKDpjbGljaykgZG8gfGV8XG5cdFx0XHRcdCMgT25seSBmb3IgbWFpbiBtb3VzZWJ1dHRvbiwgbm8/XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRlLkBpbWJhU2ltdWxhdGVkVGFwID0geWVzXG5cdFx0XHRcdFx0dmFyIHRhcCA9IEltYmEuRXZlbnQubmV3KGUpXG5cdFx0XHRcdFx0dGFwLnR5cGUgPSAndGFwJ1xuXHRcdFx0XHRcdHRhcC5wcm9jZXNzXG5cdFx0XHRcdFx0aWYgdGFwLkByZXNwb25kZXJcblx0XHRcdFx0XHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0XG5cdFx0XHRcdCMgZGVsZWdhdGUgdGhlIHJlYWwgY2xpY2sgZXZlbnRcblx0XHRcdFx0SW1iYS5FdmVudHMuZGVsZWdhdGUoZSlcblxuXHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDptb3VzZWRvd24pIGRvIHxlfFxuXHRcdFx0XHRpZiAoZTp0aW1lU3RhbXAgLSBJbWJhLlRvdWNoLkxhc3RUaW1lc3RhbXApID4gSW1iYS5Ub3VjaC5UYXBUaW1lb3V0XG5cdFx0XHRcdFx0SW1iYS5QT0lOVEVSLnVwZGF0ZShlKS5wcm9jZXNzIGlmIEltYmEuUE9JTlRFUlxuXG5cdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNldXApIGRvIHxlfFxuXHRcdFx0XHRpZiAoZTp0aW1lU3RhbXAgLSBJbWJhLlRvdWNoLkxhc3RUaW1lc3RhbXApID4gSW1iYS5Ub3VjaC5UYXBUaW1lb3V0XG5cdFx0XHRcdFx0SW1iYS5QT0lOVEVSLnVwZGF0ZShlKS5wcm9jZXNzIGlmIEltYmEuUE9JTlRFUlxuXG5cdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3RlcihbOm1vdXNlZG93biw6bW91c2V1cF0pXG5cdFx0XHRJbWJhLkV2ZW50cy5lbmFibGVkID0geWVzXG5cdFx0XHRyZXR1cm4gSW1iYS5FdmVudHNcblxuXG5cdGRlZiBpbml0aWFsaXplIG5vZGUsIGV2ZW50czogW11cblx0XHRAc2hpbUZvY3VzRXZlbnRzID0gJHdlYiQgJiYgd2luZG93Om5ldHNjYXBlICYmIG5vZGU6b25mb2N1c2luID09PSB1bmRlZmluZWRcblx0XHRyb290ID0gbm9kZVxuXHRcdGxpc3RlbmVycyA9IFtdXG5cdFx0ZGVsZWdhdG9ycyA9IHt9XG5cdFx0ZGVsZWdhdG9yID0gZG8gfGV8IFxuXHRcdFx0ZGVsZWdhdGUoZSlcblx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRmb3IgZXZlbnQgaW4gZXZlbnRzXG5cdFx0XHRyZWdpc3RlcihldmVudClcblxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cblx0VGVsbCB0aGUgY3VycmVudCBFdmVudE1hbmFnZXIgdG8gaW50ZXJjZXB0IGFuZCBoYW5kbGUgZXZlbnQgb2YgYSBjZXJ0YWluIG5hbWUuXG5cdEJ5IGRlZmF1bHQsIEltYmEuRXZlbnRzIHdpbGwgcmVnaXN0ZXIgaW50ZXJjZXB0b3JzIGZvcjogKmtleWRvd24qLCAqa2V5dXAqLCBcblx0KmtleXByZXNzKiwgKnRleHRJbnB1dCosICppbnB1dCosICpjaGFuZ2UqLCAqc3VibWl0KiwgKmZvY3VzaW4qLCAqZm9jdXNvdXQqLCBcblx0KmJsdXIqLCAqY29udGV4dG1lbnUqLCAqZGJsY2xpY2sqLCAqbW91c2V3aGVlbCosICp3aGVlbCpcblxuXHQjIyNcblx0ZGVmIHJlZ2lzdGVyIG5hbWUsIGhhbmRsZXIgPSB0cnVlXG5cdFx0aWYgbmFtZSBpc2EgQXJyYXlcblx0XHRcdHJlZ2lzdGVyKHYsaGFuZGxlcikgZm9yIHYgaW4gbmFtZVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdHJldHVybiBzZWxmIGlmIGRlbGVnYXRvcnNbbmFtZV1cblx0XHQjIGNvbnNvbGUubG9nKFwicmVnaXN0ZXIgZm9yIGV2ZW50IHtuYW1lfVwiKVxuXHRcdHZhciBmbiA9IGRlbGVnYXRvcnNbbmFtZV0gPSBoYW5kbGVyIGlzYSBGdW5jdGlvbiA/IGhhbmRsZXIgOiBkZWxlZ2F0b3Jcblx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIobmFtZSxmbix5ZXMpIGlmIGVuYWJsZWRcblxuXHRkZWYgbGlzdGVuIG5hbWUsIGhhbmRsZXIsIGNhcHR1cmUgPSB5ZXNcblx0XHRsaXN0ZW5lcnMucHVzaChbbmFtZSxoYW5kbGVyLGNhcHR1cmVdKVxuXHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIsY2FwdHVyZSkgaWYgZW5hYmxlZFxuXHRcdHNlbGZcblxuXHRkZWYgZGVsZWdhdGUgZVxuXHRcdHZhciBldmVudCA9IEltYmEuRXZlbnQud3JhcChlKVxuXHRcdGV2ZW50LnByb2Nlc3Ncblx0XHRpZiBAc2hpbUZvY3VzRXZlbnRzXG5cdFx0XHRpZiBlOnR5cGUgPT0gJ2ZvY3VzJ1xuXHRcdFx0XHRJbWJhLkV2ZW50LndyYXAoZSkuc2V0VHlwZSgnZm9jdXNpbicpLnByb2Nlc3Ncblx0XHRcdGVsaWYgZTp0eXBlID09ICdibHVyJ1xuXHRcdFx0XHRJbWJhLkV2ZW50LndyYXAoZSkuc2V0VHlwZSgnZm9jdXNvdXQnKS5wcm9jZXNzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXG5cdENyZWF0ZSBhIG5ldyBJbWJhLkV2ZW50XG5cblx0IyMjXG5cdGRlZiBjcmVhdGUgdHlwZSwgdGFyZ2V0LCBkYXRhOiBudWxsLCBzb3VyY2U6IG51bGxcblx0XHR2YXIgZXZlbnQgPSBJbWJhLkV2ZW50LndyYXAgdHlwZTogdHlwZSwgdGFyZ2V0OiB0YXJnZXRcblx0XHRldmVudC5kYXRhID0gZGF0YSBpZiBkYXRhXG5cdFx0ZXZlbnQuc291cmNlID0gc291cmNlIGlmIHNvdXJjZVxuXHRcdGV2ZW50XG5cblx0IyMjXG5cblx0VHJpZ2dlciAvIHByb2Nlc3MgYW4gSW1iYS5FdmVudC5cblxuXHQjIyNcblx0ZGVmIHRyaWdnZXJcblx0XHRjcmVhdGUoKmFyZ3VtZW50cykucHJvY2Vzc1xuXG5cdGRlZiBvbmVuYWJsZVxuXHRcdGZvciBvd24gbmFtZSxoYW5kbGVyIG9mIGRlbGVnYXRvcnNcblx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIseWVzKVxuXG5cdFx0Zm9yIGl0ZW0gaW4gbGlzdGVuZXJzXG5cdFx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIoaXRlbVswXSxpdGVtWzFdLGl0ZW1bMl0pXG5cdFx0XHRcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsSW1iYTpjb21taXQpXG5cdFx0c2VsZlxuXG5cdGRlZiBvbmRpc2FibGVcblx0XHRmb3Igb3duIG5hbWUsaGFuZGxlciBvZiBkZWxlZ2F0b3JzXG5cdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSxoYW5kbGVyLHllcylcblxuXHRcdGZvciBpdGVtIGluIGxpc3RlbmVyc1xuXHRcdFx0cm9vdC5yZW1vdmVFdmVudExpc3RlbmVyKGl0ZW1bMF0saXRlbVsxXSxpdGVtWzJdKVxuXG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLEltYmE6Y29tbWl0KVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vZXZlbnQtbWFuYWdlci5pbWJhIiwiZXh0ZXJuIG5hdmlnYXRvclxuXG52YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbmRlZiByZW1vdmVOZXN0ZWQgcm9vdCwgbm9kZSwgY2FyZXRcblx0IyBpZiBub2RlL25vZGVzIGlzYSBTdHJpbmdcblx0IyBcdHdlIG5lZWQgdG8gdXNlIHRoZSBjYXJldCB0byByZW1vdmUgZWxlbWVudHNcblx0IyBcdGZvciBub3cgd2Ugd2lsbCBzaW1wbHkgbm90IHN1cHBvcnQgdGhpc1xuXHRpZiBub2RlIGlzYSBBcnJheVxuXHRcdHJlbW92ZU5lc3RlZChyb290LG1lbWJlcixjYXJldCkgZm9yIG1lbWJlciBpbiBub2RlXG5cdGVsaWYgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0cm9vdC5yZW1vdmVDaGlsZChub2RlKVxuXHRlbGlmIG5vZGUgIT0gbnVsbFxuXHRcdCMgd2hhdCBpZiB0aGlzIGlzIG5vdCBudWxsPyE/IT9cblx0XHQjIHRha2UgYSBjaGFuY2UgYW5kIHJlbW92ZSBhIHRleHQtZWxlbWVudG5nXG5cdFx0bGV0IG5leHQgPSBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRpZiBuZXh0IGlzYSBUZXh0IGFuZCBuZXh0OnRleHRDb250ZW50ID09IG5vZGVcblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQobmV4dClcblx0XHRlbHNlXG5cdFx0XHR0aHJvdyAnY2Fubm90IHJlbW92ZSBzdHJpbmcnXG5cblx0cmV0dXJuIGNhcmV0XG5cbmRlZiBhcHBlbmROZXN0ZWQgcm9vdCwgbm9kZVxuXHRpZiBub2RlIGlzYSBBcnJheVxuXHRcdGxldCBpID0gMFxuXHRcdGxldCBjID0gbm9kZTp0YWdsZW5cblx0XHRsZXQgayA9IGMgIT0gbnVsbCA/IChub2RlOmRvbWxlbiA9IGMpIDogbm9kZTpsZW5ndGhcblx0XHRhcHBlbmROZXN0ZWQocm9vdCxub2RlW2krK10pIHdoaWxlIGkgPCBrXG5cdGVsaWYgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0cm9vdC5hcHBlbmRDaGlsZChub2RlKVxuXHRlbGlmIG5vZGUgIT0gbnVsbCBhbmQgbm9kZSAhPT0gZmFsc2Vcblx0XHRyb290LmFwcGVuZENoaWxkIEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRyZXR1cm5cblxuXG4jIGluc2VydCBub2RlcyBiZWZvcmUgYSBjZXJ0YWluIG5vZGVcbiMgZG9lcyBub3QgbmVlZCB0byByZXR1cm4gYW55IHRhaWwsIGFzIGJlZm9yZVxuIyB3aWxsIHN0aWxsIGJlIGNvcnJlY3QgdGhlcmVcbiMgYmVmb3JlIG11c3QgYmUgYW4gYWN0dWFsIGRvbW5vZGVcbmRlZiBpbnNlcnROZXN0ZWRCZWZvcmUgcm9vdCwgbm9kZSwgYmVmb3JlXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0bGV0IGkgPSAwXG5cdFx0bGV0IGMgPSBub2RlOnRhZ2xlblxuXHRcdGxldCBrID0gYyAhPSBudWxsID8gKG5vZGU6ZG9tbGVuID0gYykgOiBub2RlOmxlbmd0aFxuXHRcdGluc2VydE5lc3RlZEJlZm9yZShyb290LG5vZGVbaSsrXSxiZWZvcmUpIHdoaWxlIGkgPCBrXG5cblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290Lmluc2VydEJlZm9yZShub2RlLGJlZm9yZSlcblx0ZWxpZiBub2RlICE9IG51bGwgYW5kIG5vZGUgIT09IGZhbHNlXG5cdFx0cm9vdC5pbnNlcnRCZWZvcmUoSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKSxiZWZvcmUpXG5cblx0cmV0dXJuIGJlZm9yZVxuXG4jIGFmdGVyIG11c3QgYmUgYW4gYWN0dWFsIGRvbW5vZGVcbmRlZiBpbnNlcnROZXN0ZWRBZnRlciByb290LCBub2RlLCBhZnRlclxuXHR2YXIgYmVmb3JlID0gYWZ0ZXIgPyBhZnRlcjpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cblx0aWYgYmVmb3JlXG5cdFx0aW5zZXJ0TmVzdGVkQmVmb3JlKHJvb3Qsbm9kZSxiZWZvcmUpXG5cdFx0cmV0dXJuIGJlZm9yZTpwcmV2aW91c1NpYmxpbmdcblx0ZWxzZVxuXHRcdGFwcGVuZE5lc3RlZChyb290LG5vZGUpXG5cdFx0cmV0dXJuIHJvb3QuQGRvbTpsYXN0Q2hpbGRcblxuZGVmIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzIHJvb3QsIG5ldywgb2xkLCBjYXJldFxuXG5cdHZhciBuZXdMZW4gPSBuZXc6bGVuZ3RoXG5cdHZhciBsYXN0TmV3ID0gbmV3W25ld0xlbiAtIDFdXG5cblx0IyBUaGlzIHJlLW9yZGVyIGFsZ29yaXRobSBpcyBiYXNlZCBvbiB0aGUgZm9sbG93aW5nIHByaW5jaXBsZTpcblx0IyBcblx0IyBXZSBidWlsZCBhIFwiY2hhaW5cIiB3aGljaCBzaG93cyB3aGljaCBpdGVtcyBhcmUgYWxyZWFkeSBzb3J0ZWQuXG5cdCMgSWYgd2UncmUgZ29pbmcgZnJvbSBbMSwgMiwgM10gLT4gWzIsIDEsIDNdLCB0aGUgdHJlZSBsb29rcyBsaWtlOlxuXHQjXG5cdCMgXHQzIC0+ICAwIChpZHgpXG5cdCMgXHQyIC0+IC0xIChpZHgpXG5cdCMgXHQxIC0+IC0xIChpZHgpXG5cdCNcblx0IyBUaGlzIHRlbGxzIHVzIHRoYXQgd2UgaGF2ZSB0d28gY2hhaW5zIG9mIG9yZGVyZWQgaXRlbXM6XG5cdCMgXG5cdCMgXHQoMSwgMykgYW5kICgyKVxuXHQjIFxuXHQjIFRoZSBvcHRpbWFsIHJlLW9yZGVyaW5nIHRoZW4gYmVjb21lcyB0byBrZWVwIHRoZSBsb25nZXN0IGNoYWluIGludGFjdCxcblx0IyBhbmQgbW92ZSBhbGwgdGhlIG90aGVyIGl0ZW1zLlxuXG5cdHZhciBuZXdQb3NpdGlvbiA9IFtdXG5cblx0IyBUaGUgdHJlZS9ncmFwaCBpdHNlbGZcblx0dmFyIHByZXZDaGFpbiA9IFtdXG5cdCMgVGhlIGxlbmd0aCBvZiB0aGUgY2hhaW5cblx0dmFyIGxlbmd0aENoYWluID0gW11cblxuXHQjIEtlZXAgdHJhY2sgb2YgdGhlIGxvbmdlc3QgY2hhaW5cblx0dmFyIG1heENoYWluTGVuZ3RoID0gMFxuXHR2YXIgbWF4Q2hhaW5FbmQgPSAwXG5cblx0dmFyIGhhc1RleHROb2RlcyA9IG5vXG5cdHZhciBuZXdQb3NcblxuXHRmb3Igbm9kZSwgaWR4IGluIG9sZFxuXHRcdCMgc3BlY2lhbCBjYXNlIGZvciBUZXh0IG5vZGVzXG5cdFx0aWYgbm9kZSBhbmQgbm9kZTpub2RlVHlwZSA9PSAzXG5cdFx0XHRuZXdQb3MgPSBuZXcuaW5kZXhPZihub2RlOnRleHRDb250ZW50KVxuXHRcdFx0bmV3W25ld1Bvc10gPSBub2RlIGlmIG5ld1BvcyA+PSAwXG5cdFx0XHRoYXNUZXh0Tm9kZXMgPSB5ZXNcblx0XHRlbHNlXG5cdFx0XHRuZXdQb3MgPSBuZXcuaW5kZXhPZihub2RlKVxuXG5cdFx0bmV3UG9zaXRpb24ucHVzaChuZXdQb3MpXG5cblx0XHRpZiBuZXdQb3MgPT0gLTFcblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQobm9kZSlcblx0XHRcdHByZXZDaGFpbi5wdXNoKC0xKVxuXHRcdFx0bGVuZ3RoQ2hhaW4ucHVzaCgtMSlcblx0XHRcdGNvbnRpbnVlXG5cblx0XHR2YXIgcHJldklkeCA9IG5ld1Bvc2l0aW9uOmxlbmd0aCAtIDJcblxuXHRcdCMgQnVpbGQgdGhlIGNoYWluOlxuXHRcdHdoaWxlIHByZXZJZHggPj0gMFxuXHRcdFx0aWYgbmV3UG9zaXRpb25bcHJldklkeF0gPT0gLTFcblx0XHRcdFx0cHJldklkeC0tXG5cdFx0XHRlbGlmIG5ld1BvcyA+IG5ld1Bvc2l0aW9uW3ByZXZJZHhdXG5cdFx0XHRcdCMgWWF5LCB3ZSdyZSBiaWdnZXIgdGhhbiB0aGUgcHJldmlvdXMhXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRlbHNlXG5cdFx0XHRcdCMgTm9wZSwgbGV0J3Mgd2FsayBiYWNrIHRoZSBjaGFpblxuXHRcdFx0XHRwcmV2SWR4ID0gcHJldkNoYWluW3ByZXZJZHhdXG5cblx0XHRwcmV2Q2hhaW4ucHVzaChwcmV2SWR4KVxuXG5cdFx0dmFyIGN1cnJMZW5ndGggPSAocHJldklkeCA9PSAtMSkgPyAwIDogbGVuZ3RoQ2hhaW5bcHJldklkeF0rMVxuXG5cdFx0aWYgY3Vyckxlbmd0aCA+IG1heENoYWluTGVuZ3RoXG5cdFx0XHRtYXhDaGFpbkxlbmd0aCA9IGN1cnJMZW5ndGhcblx0XHRcdG1heENoYWluRW5kID0gaWR4XG5cblx0XHRsZW5ndGhDaGFpbi5wdXNoKGN1cnJMZW5ndGgpXG5cblx0dmFyIHN0aWNreU5vZGVzID0gW11cblxuXHQjIE5vdyB3ZSBjYW4gd2FsayB0aGUgbG9uZ2VzdCBjaGFpbiBiYWNrd2FyZHMgYW5kIG1hcmsgdGhlbSBhcyBcInN0aWNreVwiLFxuXHQjIHdoaWNoIGltcGxpZXMgdGhhdCB0aGV5IHNob3VsZCBub3QgYmUgbW92ZWRcblx0dmFyIGN1cnNvciA9IG5ld1Bvc2l0aW9uOmxlbmd0aCAtIDFcblx0d2hpbGUgY3Vyc29yID49IDBcblx0XHRpZiBjdXJzb3IgPT0gbWF4Q2hhaW5FbmQgYW5kIG5ld1Bvc2l0aW9uW2N1cnNvcl0gIT0gLTFcblx0XHRcdHN0aWNreU5vZGVzW25ld1Bvc2l0aW9uW2N1cnNvcl1dID0gdHJ1ZVxuXHRcdFx0bWF4Q2hhaW5FbmQgPSBwcmV2Q2hhaW5bbWF4Q2hhaW5FbmRdXG5cblx0XHRjdXJzb3IgLT0gMVxuXG5cdCMgcG9zc2libGUgdG8gZG8gdGhpcyBpbiByZXZlcnNlZCBvcmRlciBpbnN0ZWFkP1xuXHRmb3Igbm9kZSwgaWR4IGluIG5ld1xuXHRcdGlmICFzdGlja3lOb2Rlc1tpZHhdXG5cdFx0XHQjIGNyZWF0ZSB0ZXh0bm9kZSBmb3Igc3RyaW5nLCBhbmQgdXBkYXRlIHRoZSBhcnJheVxuXHRcdFx0dW5sZXNzIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdFx0XHRub2RlID0gbmV3W2lkeF0gPSBJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cblx0XHRcdHZhciBhZnRlciA9IG5ld1tpZHggLSAxXVxuXHRcdFx0aW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCwgbm9kZSwgKGFmdGVyIGFuZCBhZnRlci5AZG9tIG9yIGFmdGVyIG9yIGNhcmV0KSlcblxuXHRcdGNhcmV0ID0gbm9kZS5AZG9tIG9yIChjYXJldCBhbmQgY2FyZXQ6bmV4dFNpYmxpbmcgb3Igcm9vdC5AZG9tOmZpcnN0Q2hpbGQpXG5cblx0IyBzaG91bGQgdHJ1c3QgdGhhdCB0aGUgbGFzdCBpdGVtIGluIG5ldyBsaXN0IGlzIHRoZSBjYXJldFxuXHRyZXR1cm4gbGFzdE5ldyBhbmQgbGFzdE5ldy5AZG9tIG9yIGNhcmV0XG5cblxuIyBleHBlY3RzIGEgZmxhdCBub24tc3BhcnNlIGFycmF5IG9mIG5vZGVzIGluIGJvdGggbmV3IGFuZCBvbGQsIGFsd2F5c1xuZGVmIHJlY29uY2lsZUNvbGxlY3Rpb24gcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cdHZhciBrID0gbmV3Omxlbmd0aFxuXHR2YXIgaSA9IGtcblx0dmFyIGxhc3QgPSBuZXdbayAtIDFdXG5cblxuXHRpZiBrID09IG9sZDpsZW5ndGggYW5kIG5ld1swXSA9PT0gb2xkWzBdXG5cdFx0IyBydW5uaW5nIHRocm91Z2ggdG8gY29tcGFyZVxuXHRcdHdoaWxlIGktLVxuXHRcdFx0YnJlYWsgaWYgbmV3W2ldICE9PSBvbGRbaV1cblxuXHRpZiBpID09IC0xXG5cdFx0cmV0dXJuIGxhc3QgYW5kIGxhc3QuQGRvbSBvciBsYXN0IG9yIGNhcmV0XG5cdGVsc2Vcblx0XHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMocm9vdCxuZXcsb2xkLGNhcmV0KVxuXG4jIFRZUEUgNSAtIHdlIGtub3cgdGhhdCB3ZSBhcmUgZGVhbGluZyB3aXRoIGEgc2luZ2xlIGFycmF5IG9mXG4jIGtleWVkIHRhZ3MgLSBhbmQgcm9vdCBoYXMgbm8gb3RoZXIgY2hpbGRyZW5cbmRlZiByZWNvbmNpbGVMb29wIHJvb3QsIG5ldywgb2xkLCBjYXJldFxuXHR2YXIgbmwgPSBuZXc6bGVuZ3RoXG5cdHZhciBvbCA9IG9sZDpsZW5ndGhcblx0dmFyIGNsID0gbmV3OmNhY2hlOmkkICMgY2FjaGUtbGVuZ3RoXG5cdHZhciBpID0gMCwgZCA9IG5sIC0gb2xcblxuXHQjIGZpbmQgdGhlIGZpcnN0IGluZGV4IHRoYXQgaXMgZGlmZmVyZW50XG5cdGkrKyB3aGlsZSBpIDwgb2wgYW5kIGkgPCBubCBhbmQgbmV3W2ldID09PSBvbGRbaV1cblx0XG5cdCMgY29uZGl0aW9uYWxseSBwcnVuZSBjYWNoZVxuXHRpZiBjbCA+IDEwMDAgYW5kIChjbCAtIG5sKSA+IDUwMFxuXHRcdG5ldzpjYWNoZTokcHJ1bmUobmV3KVxuXHRcblx0aWYgZCA+IDAgYW5kIGkgPT0gb2xcblx0XHQjIGFkZGVkIGF0IGVuZFxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQobmV3W2krK10pIHdoaWxlIGkgPCBubFxuXHRcdHJldHVyblxuXHRcblx0ZWxpZiBkID4gMFxuXHRcdGxldCBpMSA9IG5sXG5cdFx0aTEtLSB3aGlsZSBpMSA+IGkgYW5kIG5ld1tpMSAtIDFdID09PSBvbGRbaTEgLSAxIC0gZF1cblxuXHRcdGlmIGQgPT0gKGkxIC0gaSlcblx0XHRcdCMgY29uc29sZS5sb2cgXCJhZGRlZCBpbiBjaHVua1wiLGksaTFcblx0XHRcdGxldCBiZWZvcmUgPSBvbGRbaV0uQGRvbVxuXHRcdFx0cm9vdC5pbnNlcnRCZWZvcmUobmV3W2krK10sYmVmb3JlKSB3aGlsZSBpIDwgaTFcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdGVsaWYgZCA8IDAgYW5kIGkgPT0gbmxcblx0XHQjIHJlbW92ZWQgYXQgZW5kXG5cdFx0cm9vdC5yZW1vdmVDaGlsZChvbGRbaSsrXSkgd2hpbGUgaSA8IG9sXG5cdFx0cmV0dXJuXG5cdGVsaWYgZCA8IDBcblx0XHRsZXQgaTEgPSBvbFxuXHRcdGkxLS0gd2hpbGUgaTEgPiBpIGFuZCBuZXdbaTEgLSAxICsgZF0gPT09IG9sZFtpMSAtIDFdXG5cblx0XHRpZiBkID09IChpIC0gaTEpXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZFtpKytdKSB3aGlsZSBpIDwgaTFcblx0XHRcdHJldHVyblxuXG5cdGVsaWYgaSA9PSBubFxuXHRcdHJldHVyblxuXG5cdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyhyb290LG5ldyxvbGQsY2FyZXQpXG5cbiMgZXhwZWN0cyBhIGZsYXQgbm9uLXNwYXJzZSBhcnJheSBvZiBub2RlcyBpbiBib3RoIG5ldyBhbmQgb2xkLCBhbHdheXNcbmRlZiByZWNvbmNpbGVJbmRleGVkQXJyYXkgcm9vdCwgYXJyYXksIG9sZCwgY2FyZXRcblx0dmFyIG5ld0xlbiA9IGFycmF5OnRhZ2xlblxuXHR2YXIgcHJldkxlbiA9IGFycmF5OmRvbWxlbiBvciAwXG5cdHZhciBsYXN0ID0gbmV3TGVuID8gYXJyYXlbbmV3TGVuIC0gMV0gOiBudWxsXG5cdCMgY29uc29sZS5sb2cgXCJyZWNvbmNpbGUgb3B0aW1pemVkIGFycmF5KCEpXCIsY2FyZXQsbmV3TGVuLHByZXZMZW4sYXJyYXlcblxuXHRpZiBwcmV2TGVuID4gbmV3TGVuXG5cdFx0d2hpbGUgcHJldkxlbiA+IG5ld0xlblxuXHRcdFx0dmFyIGl0ZW0gPSBhcnJheVstLXByZXZMZW5dXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKGl0ZW0uQGRvbSlcblxuXHRlbGlmIG5ld0xlbiA+IHByZXZMZW5cblx0XHQjIGZpbmQgdGhlIGl0ZW0gdG8gaW5zZXJ0IGJlZm9yZVxuXHRcdGxldCBwcmV2TGFzdCA9IHByZXZMZW4gPyBhcnJheVtwcmV2TGVuIC0gMV0uQGRvbSA6IGNhcmV0XG5cdFx0bGV0IGJlZm9yZSA9IHByZXZMYXN0ID8gcHJldkxhc3Q6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdFxuXHRcdHdoaWxlIHByZXZMZW4gPCBuZXdMZW5cblx0XHRcdGxldCBub2RlID0gYXJyYXlbcHJldkxlbisrXVxuXHRcdFx0YmVmb3JlID8gcm9vdC5pbnNlcnRCZWZvcmUobm9kZS5AZG9tLGJlZm9yZSkgOiByb290LmFwcGVuZENoaWxkKG5vZGUuQGRvbSlcblx0XHRcdFxuXHRhcnJheTpkb21sZW4gPSBuZXdMZW5cblx0cmV0dXJuIGxhc3QgPyBsYXN0LkBkb20gOiBjYXJldFxuXG5cbiMgdGhlIGdlbmVyYWwgcmVjb25jaWxlciB0aGF0IHJlc3BlY3RzIGNvbmRpdGlvbnMgZXRjXG4jIGNhcmV0IGlzIHRoZSBjdXJyZW50IG5vZGUgd2Ugd2FudCB0byBpbnNlcnQgdGhpbmdzIGFmdGVyXG5kZWYgcmVjb25jaWxlTmVzdGVkIHJvb3QsIG5ldywgb2xkLCBjYXJldFxuXG5cdCMgdmFyIHNraXBuZXcgPSBuZXcgPT0gbnVsbCBvciBuZXcgPT09IGZhbHNlIG9yIG5ldyA9PT0gdHJ1ZVxuXHR2YXIgbmV3SXNOdWxsID0gbmV3ID09IG51bGwgb3IgbmV3ID09PSBmYWxzZVxuXHR2YXIgb2xkSXNOdWxsID0gb2xkID09IG51bGwgb3Igb2xkID09PSBmYWxzZVxuXG5cblx0aWYgbmV3ID09PSBvbGRcblx0XHQjIHJlbWVtYmVyIHRoYXQgdGhlIGNhcmV0IG11c3QgYmUgYW4gYWN0dWFsIGRvbSBlbGVtZW50XG5cdFx0IyB3ZSBzaG91bGQgaW5zdGVhZCBtb3ZlIHRoZSBhY3R1YWwgY2FyZXQ/IC0gdHJ1c3Rcblx0XHRpZiBuZXdJc051bGxcblx0XHRcdHJldHVybiBjYXJldFxuXHRcdGVsaWYgbmV3LkBkb21cblx0XHRcdHJldHVybiBuZXcuQGRvbVxuXHRcdGVsaWYgbmV3IGlzYSBBcnJheSBhbmQgbmV3OnRhZ2xlbiAhPSBudWxsXG5cdFx0XHRyZXR1cm4gcmVjb25jaWxlSW5kZXhlZEFycmF5KHJvb3QsbmV3LG9sZCxjYXJldClcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cblx0ZWxpZiBuZXcgaXNhIEFycmF5XG5cdFx0aWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0IyBsb29rIGZvciBzbG90IGluc3RlYWQ/XG5cdFx0XHRsZXQgdHlwID0gbmV3OnN0YXRpY1xuXHRcdFx0aWYgdHlwIG9yIG9sZDpzdGF0aWNcblx0XHRcdFx0IyBpZiB0aGUgc3RhdGljIGlzIG5vdCBuZXN0ZWQgLSB3ZSBjb3VsZCBnZXQgYSBoaW50IGZyb20gY29tcGlsZXJcblx0XHRcdFx0IyBhbmQganVzdCBza2lwIGl0XG5cdFx0XHRcdGlmIHR5cCA9PSBvbGQ6c3RhdGljICMgc2hvdWxkIGFsc28gaW5jbHVkZSBhIHJlZmVyZW5jZT9cblx0XHRcdFx0XHRmb3IgaXRlbSxpIGluIG5ld1xuXHRcdFx0XHRcdFx0IyB0aGlzIGlzIHdoZXJlIHdlIGNvdWxkIGRvIHRoZSB0cmlwbGUgZXF1YWwgZGlyZWN0bHlcblx0XHRcdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHJvb3QsaXRlbSxvbGRbaV0sY2FyZXQpXG5cdFx0XHRcdFx0cmV0dXJuIGNhcmV0XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRyZW1vdmVOZXN0ZWQocm9vdCxvbGQsY2FyZXQpXG5cdFx0XHRcdFx0XG5cdFx0XHRcdCMgaWYgdGhleSBhcmUgbm90IHRoZSBzYW1lIHdlIGNvbnRpbnVlIHRocm91Z2ggdG8gdGhlIGRlZmF1bHRcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBDb3VsZCB1c2Ugb3B0aW1pemVkIGxvb3AgaWYgd2Uga25vdyB0aGF0IGl0IG9ubHkgY29uc2lzdHMgb2Ygbm9kZXNcblx0XHRcdFx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb24ocm9vdCxuZXcsb2xkLGNhcmV0KVxuXHRcdGVsaWYgIW9sZElzTnVsbFxuXHRcdFx0aWYgb2xkLkBkb21cblx0XHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdCMgb2xkIHdhcyBhIHN0cmluZy1saWtlIG9iamVjdD9cblx0XHRcdFx0cm9vdC5yZW1vdmVDaGlsZChjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGQpXG5cblx0XHRyZXR1cm4gaW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCxuZXcsY2FyZXQpXG5cdFx0IyByZW1vdmUgb2xkXG5cblx0ZWxpZiAhbmV3SXNOdWxsIGFuZCBuZXcuQGRvbVxuXHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldCkgdW5sZXNzIG9sZElzTnVsbFxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblxuXHRlbGlmIG5ld0lzTnVsbFxuXHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldCkgdW5sZXNzIG9sZElzTnVsbFxuXHRcdHJldHVybiBjYXJldFxuXHRlbHNlXG5cdFx0IyBpZiBvbGQgZGlkIG5vdCBleGlzdCB3ZSBuZWVkIHRvIGFkZCBhIG5ldyBkaXJlY3RseVxuXHRcdGxldCBuZXh0Tm9kZVxuXHRcdCMgaWYgb2xkIHdhcyBhcnJheSBvciBpbWJhdGFnIHdlIG5lZWQgdG8gcmVtb3ZlIGl0IGFuZCB0aGVuIGFkZFxuXHRcdGlmIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRlbGlmIG9sZCBhbmQgb2xkLkBkb21cblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkKVxuXHRcdGVsaWYgIW9sZElzTnVsbFxuXHRcdFx0IyAuLi5cblx0XHRcdG5leHROb2RlID0gY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRpZiBuZXh0Tm9kZSBpc2EgVGV4dCBhbmQgbmV4dE5vZGU6dGV4dENvbnRlbnQgIT0gbmV3XG5cdFx0XHRcdG5leHROb2RlOnRleHRDb250ZW50ID0gbmV3XG5cdFx0XHRcdHJldHVybiBuZXh0Tm9kZVxuXG5cdFx0IyBub3cgYWRkIHRoZSB0ZXh0bm9kZVxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblxuXG5leHRlbmQgdGFnIGVsZW1lbnRcblx0XG5cdCMgMSAtIHN0YXRpYyBzaGFwZSAtIHVua25vd24gY29udGVudFxuXHQjIDIgLSBzdGF0aWMgc2hhcGUgYW5kIHN0YXRpYyBjaGlsZHJlblxuXHQjIDMgLSBzaW5nbGUgaXRlbVxuXHQjIDQgLSBvcHRpbWl6ZWQgYXJyYXkgLSBvbmx5IGxlbmd0aCB3aWxsIGNoYW5nZVxuXHQjIDUgLSBvcHRpbWl6ZWQgY29sbGVjdGlvblxuXHQjIDYgLSB0ZXh0IG9ubHlcblxuXHRkZWYgc2V0Q2hpbGRyZW4gbmV3LCB0eXBcblx0XHQjIGlmIHR5cGVvZiBuZXcgPT0gJ3N0cmluZydcblx0XHQjIFx0cmV0dXJuIHNlbGYudGV4dCA9IG5ld1xuXHRcdHZhciBvbGQgPSBAdHJlZV9cblxuXHRcdGlmIG5ldyA9PT0gb2xkIGFuZCBuZXcgYW5kIG5ldzp0YWdsZW4gPT0gdW5kZWZpbmVkXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYgIW9sZCBhbmQgdHlwICE9IDNcblx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cblx0XHRlbGlmIHR5cCA9PSAxXG5cdFx0XHRsZXQgY2FyZXQgPSBudWxsXG5cdFx0XHRmb3IgaXRlbSxpIGluIG5ld1xuXHRcdFx0XHRjYXJldCA9IHJlY29uY2lsZU5lc3RlZChzZWxmLGl0ZW0sb2xkW2ldLGNhcmV0KVxuXHRcdFxuXHRcdGVsaWYgdHlwID09IDJcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRlbGlmIHR5cCA9PSAzXG5cdFx0XHRsZXQgbnR5cCA9IHR5cGVvZiBuZXdcblxuXHRcdFx0aWYgbmV3IGFuZCBuZXcuQGRvbVxuXHRcdFx0XHRyZW1vdmVBbGxDaGlsZHJlblxuXHRcdFx0XHRhcHBlbmRDaGlsZChuZXcpXG5cblx0XHRcdCMgY2hlY2sgaWYgb2xkIGFuZCBuZXcgaXNhIGFycmF5XG5cdFx0XHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRcdFx0aWYgbmV3LkB0eXBlID09IDUgYW5kIG9sZCBhbmQgb2xkLkB0eXBlID09IDVcblx0XHRcdFx0XHRyZWNvbmNpbGVMb29wKHNlbGYsbmV3LG9sZCxudWxsKVxuXHRcdFx0XHRlbGlmIG9sZCBpc2EgQXJyYXlcblx0XHRcdFx0XHRyZWNvbmNpbGVOZXN0ZWQoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRyZW1vdmVBbGxDaGlsZHJlblxuXHRcdFx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGV4dCA9IG5ld1xuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXHRcdFx0XHRcblx0XHRlbGlmIHR5cCA9PSA0XG5cdFx0XHRyZWNvbmNpbGVJbmRleGVkQXJyYXkoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcblx0XHRlbGlmIHR5cCA9PSA1XG5cdFx0XHRyZWNvbmNpbGVMb29wKHNlbGYsbmV3LG9sZCxudWxsKVxuXG5cdFx0ZWxpZiBuZXcgaXNhIEFycmF5IGFuZCBvbGQgaXNhIEFycmF5XG5cdFx0XHRyZWNvbmNpbGVOZXN0ZWQoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0ZWxzZVxuXHRcdFx0IyB3aGF0IGlmIHRleHQ/XG5cdFx0XHRyZW1vdmVBbGxDaGlsZHJlblxuXHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXG5cdFx0QHRyZWVfID0gbmV3XG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgY29udGVudFxuXHRcdEBjb250ZW50IG9yIGNoaWxkcmVuLnRvQXJyYXlcblx0XG5cdGRlZiBzZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0cmVlX1xuXHRcdFx0dmFyIHZhbCA9IHRleHQgPT09IG51bGwgb3IgdGV4dCA9PT0gZmFsc2UgPyAnJyA6IHRleHRcblx0XHRcdChAdGV4dF8gb3IgQGRvbSk6dGV4dENvbnRlbnQgPSB2YWxcblx0XHRcdEB0ZXh0XyB8fD0gQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRAdHJlZV8gPSB0ZXh0XG5cdFx0c2VsZlxuXG4jIGFsaWFzIHNldENvbnRlbnQgdG8gc2V0Q2hpbGRyZW5cbnZhciBwcm90byA9IEltYmEuVGFnOnByb3RvdHlwZVxucHJvdG86c2V0Q29udGVudCA9IHByb3RvOnNldENoaWxkcmVuXG5cbiMgb3B0aW1pemF0aW9uIGZvciBzZXRUZXh0XG52YXIgYXBwbGUgPSB0eXBlb2YgbmF2aWdhdG9yICE9ICd1bmRlZmluZWQnIGFuZCAobmF2aWdhdG9yOnZlbmRvciBvciAnJykuaW5kZXhPZignQXBwbGUnKSA9PSAwXG5pZiBhcHBsZVxuXHRkZWYgcHJvdG8uc2V0VGV4dCB0ZXh0XG5cdFx0aWYgdGV4dCAhPSBAdHJlZV9cblx0XHRcdEBkb206dGV4dENvbnRlbnQgPSAodGV4dCA9PT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSA/ICcnIDogdGV4dClcblx0XHRcdEB0cmVlXyA9IHRleHRcblx0XHRyZXR1cm4gc2VsZlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3JlY29uY2lsZXIuaW1iYSIsImltcG9ydCBSb3V0ZXIgZnJvbSAnLi91dGlsL3JvdXRlcidcblxuZXhwb3J0IGNsYXNzIERvY1xuXG5cdHByb3AgcGF0aFxuXHRwcm9wIHNyY1xuXHRwcm9wIGRhdGFcblxuXHRkZWYgcmVhZHlcblx0XHRAcmVhZHlcblxuXHRkZWYgaW5pdGlhbGl6ZSBzcmMsIGFwcFxuXHRcdEBzcmMgPSBzcmNcblx0XHRAcGF0aCA9IHNyYy5yZXBsYWNlKC9cXC5tZCQvLCcnKVxuXHRcdEBhcHAgPSBhcHBcblx0XHRAcmVhZHkgPSBub1xuXHRcdGZldGNoXG5cdFx0c2VsZlxuXG5cdGRlZiBmZXRjaFxuXHRcdEBwcm9taXNlIHx8PSBAYXBwLmZldGNoKHNyYykudGhlbiBkbyB8cmVzfFxuXHRcdFx0bG9hZChyZXMpXG5cblx0ZGVmIGxvYWQgZG9jXG5cdFx0QGRhdGEgPSBkb2Ncblx0XHRAbWV0YSA9IGRvYzptZXRhIG9yIHt9XG5cdFx0QHJlYWR5ID0geWVzXG5cdFx0SW1iYS5jb21taXRcblx0XHRzZWxmXG5cblx0ZGVmIHRpdGxlXG5cdFx0QGRhdGE6dGl0bGUgb3IgJ3BhdGgnXG5cblx0ZGVmIHRvY1xuXHRcdEBkYXRhIGFuZCBAZGF0YTp0b2NbMF1cblxuXHRkZWYgYm9keVxuXHRcdEBkYXRhIGFuZCBAZGF0YTpib2R5XG5cblxuZXhwb3J0IHZhciBDYWNoZSA9IHt9XG52YXIgcmVxdWVzdHMgPSB7fVxuXG5leHBvcnQgY2xhc3MgQXBwXG5cdHByb3AgcmVxXG5cdHByb3AgY2FjaGVcblx0cHJvcCBpc3N1ZXNcblx0XG5cdGRlZiBzZWxmLmRlc2VyaWFsaXplIGRhdGEgPSAne30nXG5cdFx0c2VsZi5uZXcgSlNPTi5wYXJzZShkYXRhLnJlcGxhY2UoL8KnwqdTQ1JJUFTCp8KnL2csXCJzY3JpcHRcIikpXG5cblx0ZGVmIGluaXRpYWxpemUgY2FjaGUgPSB7fVxuXHRcdEBjYWNoZSA9IGNhY2hlXG5cdFx0QGRvY3MgPSB7fVxuXHRcdGlmICR3ZWIkXG5cdFx0XHRAbG9jID0gZG9jdW1lbnQ6bG9jYXRpb25cblx0XHRcdFxuXHRcdGlmIEBjYWNoZTpndWlkZVxuXHRcdFx0QGd1aWRlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShAY2FjaGU6Z3VpZGUpKVxuXHRcdFx0IyBmb3IgaXRlbSxpIGluIEBndWlkZVxuXHRcdFx0IyBcdEBndWlkZVtpdGVtOmlkXSA9IGl0ZW1cblx0XHRcdCMgXHRpdGVtOm5leHQgPSBAZ3VpZGVbaSArIDFdXG5cdFx0XHQjIFx0aXRlbTpwcmV2ID0gQGd1aWRlW2kgLSAxXVxuXHRcdHNlbGZcblxuXHRkZWYgcmVzZXRcblx0XHRjYWNoZSA9IHt9XG5cdFx0c2VsZlxuXG5cdGRlZiByb3V0ZXJcblx0XHRAcm91dGVyIHx8PSBSb3V0ZXIubmV3KHNlbGYpXG5cblx0ZGVmIHBhdGhcblx0XHQkd2ViJCA/IEBsb2M6cGF0aG5hbWUgOiByZXE6cGF0aFxuXG5cdGRlZiBoYXNoXG5cdFx0JHdlYiQgPyBAbG9jOmhhc2guc3Vic3RyKDEpIDogJydcblxuXHRkZWYgZG9jIHNyY1xuXHRcdEBkb2NzW3NyY10gfHw9IERvYy5uZXcoc3JjLHNlbGYpXG5cdFx0XG5cdGRlZiBndWlkZVxuXHRcdEBndWlkZSB8fD0gQGNhY2hlOmd1aWRlICMgLm1hcCBkbyB8fFxuXHRcdFxuXHRkZWYgc2VyaWFsaXplXG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KGNhY2hlKS5yZXBsYWNlKC9cXGJzY3JpcHQvZyxcIsKnwqdTQ1JJUFTCp8KnXCIpXG5cblx0aWYgJG5vZGUkXG5cdFx0ZGVmIGZldGNoIHNyY1xuXHRcdFx0bGV0IHJlcyA9IGNhY2hlW3NyY10gPSBDYWNoZVtzcmNdXG5cdFx0XHRsZXQgcHJvbWlzZSA9IHt0aGVuOiAofGNifCBjYihDYWNoZVtzcmNdKSkgfVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4gcHJvbWlzZSBpZiByZXNcblx0XHRcdFxuXHRcdFx0Y29uc29sZS5sb2cgXCJ0cnkgdG8gZmV0Y2gge3NyY31cIlxuXHRcdFx0XG5cdFx0XHR2YXIgZnMgPSByZXF1aXJlICdmcydcblx0XHRcdHZhciBwYXRoID0gcmVxdWlyZSAncGF0aCdcblx0XHRcdHZhciBtZCA9IHJlcXVpcmUgJy4vdXRpbC9tYXJrZG93bidcblx0XHRcdHZhciBobCA9IHJlcXVpcmUgJy4vc2NyaW1ibGEvY29yZS9oaWdobGlnaHRlcidcblx0XHRcdHZhciBmaWxlcGF0aCA9IFwie19fZGlybmFtZX0vLi4vZG9jcy97c3JjfVwiLnJlcGxhY2UoL1xcL1xcLy9nLCcvJylcblxuXHRcdFx0bGV0IGJvZHkgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZXBhdGgsJ3V0Zi04JylcblxuXHRcdFx0aWYgc3JjLm1hdGNoKC9cXC5tZCQvKVxuXHRcdFx0XHRyZXMgPSBtZC5yZW5kZXIoYm9keSlcblxuXHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmpzb24kLylcblx0XHRcdFx0IyBzaG91bGQgYWxzbyBpbmNsdWRlIG1kP1xuXHRcdFx0XHRyZXMgPSBKU09OLnBhcnNlKGJvZHkpXG5cblx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5pbWJhJC8pXG5cdFx0XHRcdGxldCBodG1sID0gaGwuSGlnaGxpZ2h0ZXIuaGlnaGxpZ2h0KGJvZHkse21vZGU6ICdmdWxsJ30pXG5cdFx0XHRcdHJlcyA9IHtib2R5OiBib2R5LCBodG1sOiBodG1sfVxuXG5cdFx0XHRjYWNoZVtzcmNdID0gQ2FjaGVbc3JjXSA9IHJlc1xuXHRcdFx0cmV0dXJuIHByb21pc2Vcblx0XG5cdGlmICR3ZWIkXG5cdFx0ZGVmIGZldGNoIHNyY1xuXHRcdFx0aWYgY2FjaGVbc3JjXVxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlW3NyY10pXG5cdFx0XHRcblx0XHRcdHJlcXVlc3RzW3NyY10gfHw9IFByb21pc2UubmV3IGRvIHxyZXNvbHZlfFxuXHRcdFx0XHR2YXIgcmVxID0gYXdhaXQgd2luZG93LmZldGNoKHNyYylcblx0XHRcdFx0dmFyIHJlc3AgPSBhd2FpdCByZXEuanNvblxuXHRcdFx0XHRyZXNvbHZlKGNhY2hlW3NyY10gPSByZXNwKVxuXHRcdFx0XG5cdGRlZiBmZXRjaERvY3VtZW50IHNyYywgJmNiXG5cdFx0dmFyIHJlcyA9IGRlcHNbc3JjXVxuXHRcdGNvbnNvbGUubG9nIFwibm8gbG9uZ2VyP1wiXG5cblx0XHRpZiAkbm9kZSRcblx0XHRcdHZhciBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXHRcdFx0dmFyIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXHRcdFx0dmFyIG1kID0gcmVxdWlyZSAnLi91dGlsL21hcmtkb3duJ1xuXHRcdFx0dmFyIGhsID0gcmVxdWlyZSAnLi9zY3JpbWJsYS9jb3JlL2hpZ2hsaWdodGVyJ1xuXHRcdFx0dmFyIGZpbGVwYXRoID0gXCJ7X19kaXJuYW1lfS8uLi9kb2NzL3tzcmN9XCIucmVwbGFjZSgvXFwvXFwvL2csJy8nKVxuXG5cdFx0XHRpZiAhcmVzXG5cdFx0XHRcdGxldCBib2R5ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCd1dGYtOCcpXG5cblx0XHRcdFx0aWYgc3JjLm1hdGNoKC9cXC5tZCQvKVxuXHRcdFx0XHRcdHJlcyA9IG1kLnJlbmRlcihib2R5KVxuXG5cdFx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5qc29uJC8pXG5cdFx0XHRcdFx0IyBzaG91bGQgYWxzbyBpbmNsdWRlIG1kP1xuXHRcdFx0XHRcdHJlcyA9IEpTT04ucGFyc2UoYm9keSlcblxuXHRcdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuaW1iYSQvKVxuXHRcdFx0XHRcdGxldCBodG1sID0gaGwuSGlnaGxpZ2h0ZXIuaGlnaGxpZ2h0KGJvZHkse21vZGU6ICdmdWxsJ30pXG5cdFx0XHRcdFx0cmVzID0ge2JvZHk6IGJvZHksIGh0bWw6IGh0bWx9XG5cdFx0XHRcblx0XHRcdGRlcHNbc3JjXSB8fD0gcmVzXG5cdFx0XHRjYiBhbmQgY2IocmVzKVxuXHRcdGVsc2Vcblx0XHRcdCMgc2hvdWxkIGd1YXJkIGFnYWluc3QgbXVsdGlwbGUgbG9hZHNcblx0XHRcdGlmIHJlc1xuXHRcdFx0XHRjYiBhbmQgY2IocmVzKVxuXHRcdFx0XHRyZXR1cm4ge3RoZW46IChkbyB8dnwgdihyZXMpKX0gIyBmYWtlIHByb21pc2UgaGFja1xuXG5cdFx0XHR2YXIgeGhyID0gWE1MSHR0cFJlcXVlc3QubmV3XG5cdFx0XHR4aHIuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZCcgZG8gfHJlc3xcblx0XHRcdFx0cmVzID0gZGVwc1tzcmNdID0gSlNPTi5wYXJzZSh4aHI6cmVzcG9uc2VUZXh0KVxuXHRcdFx0XHRjYiBhbmQgY2IocmVzKVxuXHRcdFx0eGhyLm9wZW4oXCJHRVRcIiwgc3JjKVxuXHRcdFx0eGhyLnNlbmRcblxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGlzc3Vlc1xuXHRcdEBpc3N1ZXMgfHw9IERvYy5nZXQoJy9pc3N1ZXMvYWxsJywnanNvbicpXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAuaW1iYSIsImV4dGVybiBoaXN0b3J5LCBnYVxuXG5leHBvcnQgY2xhc3MgUm91dGVyXG5cblx0cHJvcCBwYXRoXG5cblx0ZGVmIHNlbGYuc2x1ZyBzdHJcblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLnRvTG93ZXJDYXNlICMgdHJpbVxuXG5cdFx0dmFyIGZyb20gPSBcIsOgw6HDpMOiw6XDqMOpw6vDqsOsw63Dr8Ouw7LDs8O2w7TDucO6w7zDu8Oxw6fCty9fLDo7XCJcblx0XHR2YXIgdG8gICA9IFwiYWFhYWFlZWVlaWlpaW9vb291dXV1bmMtLS0tLS1cIlxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9bXmEtejAtOSAtXS9nLCAnJykgIyByZW1vdmUgaW52YWxpZCBjaGFyc1xuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9cXHMrL2csICctJykgIyBjb2xsYXBzZSB3aGl0ZXNwYWNlIGFuZCByZXBsYWNlIGJ5IC1cblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvLSsvZywgJy0nKSAjIGNvbGxhcHNlIGRhc2hlc1xuXG5cdFx0cmV0dXJuIHN0clxuXG5cdGRlZiBpbml0aWFsaXplIGFwcFxuXHRcdEBhcHAgPSBhcHBcblxuXHRcdGlmICR3ZWIkXG5cdFx0XHR3aW5kb3c6b25wb3BzdGF0ZSA9IGRvIHxlfFxuXHRcdFx0XHRyZWZyZXNoXG5cblx0XHRzZWxmXG5cblx0ZGVmIHJlZnJlc2hcblx0XHRpZiAkd2ViJFxuXHRcdFx0ZG9jdW1lbnQ6Ym9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtcm91dGUnLHNlZ21lbnQoMCkpXG5cdFx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgcGF0aFxuXHRcdEBhcHAucGF0aFxuXG5cdGRlZiBoYXNoXG5cdFx0QGFwcC5oYXNoXG5cblx0ZGVmIGV4dFxuXHRcdHZhciBwYXRoID0gcGF0aFxuXHRcdHZhciBtID0gcGF0aC5tYXRjaCgvXFwuKFteXFwvXSspJC8pXG5cdFx0bSBhbmQgbVsxXSBvciAnJ1xuXG5cdGRlZiBzZWdtZW50IG5yID0gMFxuXHRcdHBhdGguc3BsaXQoJy8nKVtuciArIDFdIG9yICcnXG5cblx0ZGVmIGdvIGhyZWYsIHN0YXRlID0ge30sIHJlcGxhY2UgPSBub1xuXHRcdGlmIGhyZWYgPT0gJy9pbnN0YWxsJ1xuXHRcdFx0IyByZWRpcmVjdHMgaGVyZVxuXHRcdFx0aHJlZiA9ICcvZ3VpZGVzI3RvYy1pbnN0YWxsYXRpb24nXG5cdFx0XHRcblx0XHRpZiByZXBsYWNlXG5cdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZSxudWxsLGhyZWYpXG5cdFx0XHRyZWZyZXNoXG5cdFx0ZWxzZVxuXHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsbnVsbCxocmVmKVxuXHRcdFx0cmVmcmVzaFxuXHRcdFx0IyBnYSgnc2VuZCcsICdwYWdldmlldycsIGhyZWYpXG5cblx0XHRpZiAhaHJlZi5tYXRjaCgvXFwjLylcblx0XHRcdHdpbmRvdy5zY3JvbGxUbygwLDApXG5cdFxuXHRcdHNlbGZcblxuXHRkZWYgc2NvcGVkIHJlZywgcGFydFxuXHRcdHZhciBwYXRoID0gcGF0aCArICcjJyArIGhhc2hcblx0XHRpZiByZWcgaXNhIFN0cmluZ1xuXHRcdFx0dmFyIG54dCA9IHBhdGhbcmVnOmxlbmd0aF1cblx0XHRcdHBhdGguc3Vic3RyKDAscmVnOmxlbmd0aCkgPT0gcmVnIGFuZCAoIW54dCBvciBueHQgPT0gJy0nIG9yIG54dCA9PSAnLycgb3Igbnh0ID09ICcjJyBvciBueHQgPT0gJz8nIG9yIG54dCA9PSAnXycpXG5cdFx0ZWxpZiByZWcgaXNhIFJlZ0V4cFxuXHRcdFx0dmFyIG0gPSBwYXRoLm1hdGNoKHJlZylcblx0XHRcdHBhcnQgJiYgbSA/IG1bcGFydF0gOiBtXG5cdFx0ZWxzZVxuXHRcdFx0bm9cblxuXHRkZWYgbWF0Y2ggcmVnLCBwYXJ0XG5cdFx0dmFyIHBhdGggPSBwYXRoICsgJyMnICsgaGFzaFxuXG5cdFx0aWYgcmVnIGlzYSBTdHJpbmdcblx0XHRcdHBhdGggPT0gcmVnXG5cdFx0ZWxpZiByZWcgaXNhIFJlZ0V4cFxuXHRcdFx0dmFyIG0gPSBwYXRoLm1hdGNoKHJlZylcblx0XHRcdHBhcnQgJiYgbSA/IG1bcGFydF0gOiBtXG5cdFx0ZWxzZVxuXHRcdFx0bm9cblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cdGF0dHIgcm91dGVcblxuXHRkZWYgcm91dGVyXG5cdFx0YXBwLnJvdXRlclxuXG5cdGRlZiByZXJvdXRlXG5cdFx0dmFyIHNjb3BlZCA9IHJvdXRlci5zY29wZWQocm91dGUsc2VsZilcblx0XHRmbGFnKCdzY29wZWQnLHNjb3BlZClcblx0XHRmbGFnKCdzZWxlY3RlZCcscm91dGVyLm1hdGNoKHJvdXRlLHNlbGYpKVxuXHRcdGlmIHNjb3BlZCAhPSBAc2NvcGVkXG5cdFx0XHRAc2NvcGVkID0gc2NvcGVkXG5cdFx0XHRzY29wZWQgPyBkaWRzY29wZSA6IGRpZHVuc2NvcGVcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBkaWRzY29wZVxuXHRcdHNlbGZcblxuXHRkZWYgZGlkdW5zY29wZVxuXHRcdHNlbGZcblxuIyBleHRlbmQgbGlua3NcbmV4dGVuZCB0YWcgYVxuXHRcblx0ZGVmIHJvdXRlXG5cdFx0QHJvdXRlIG9yIGhyZWZcblxuXHRkZWYgb250YXAgZVxuXHRcdHZhciBocmVmID0gaHJlZi5yZXBsYWNlKC9eaHR0cFxcOlxcL1xcL2ltYmFcXC5pby8sJycpXG5cblx0XHRpZiBlLmV2ZW50Om1ldGFLZXkgb3IgZS5ldmVudDphbHRLZXlcblx0XHRcdGUuQHJlc3BvbmRlciA9IG51bGxcblx0XHRcdHJldHVybiBlLnN0b3BcblxuXHRcdGlmIGxldCBtID0gaHJlZi5tYXRjaCgvZ2lzdFxcLmdpdGh1YlxcLmNvbVxcLyhbXlxcL10rKVxcLyhbQS1aYS16XFxkXSspLylcblx0XHRcdGNvbnNvbGUubG9nICdnaXN0ISEnLG1bMV0sbVsyXVxuXHRcdFx0I2dpc3Qub3BlbihtWzJdKVxuXHRcdFx0cmV0dXJuIGUucHJldmVudC5zdG9wXG5cblx0XHRpZiBocmVmWzBdID09ICcjJyBvciBocmVmWzBdID09ICcvJ1xuXHRcdFx0ZS5wcmV2ZW50LnN0b3Bcblx0XHRcdHJvdXRlci5nbyhocmVmLHt9KVxuXHRcdFx0SW1iYS5FdmVudHMudHJpZ2dlcigncm91dGUnLHNlbGYpXG5cdFx0ZWxzZVxuXHRcdFx0ZS5AcmVzcG9uZGVyID0gbnVsbFxuXHRcdFx0cmV0dXJuIGUuc3RvcFx0XHRcblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdHJlcm91dGUgaWYgJHdlYiRcblx0XHRzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbC9yb3V0ZXIuaW1iYSIsImltcG9ydCBIb21lUGFnZSBmcm9tICcuL0hvbWVQYWdlJ1xuaW1wb3J0IEd1aWRlc1BhZ2UgZnJvbSAnLi9HdWlkZXNQYWdlJ1xuaW1wb3J0IERvY3NQYWdlIGZyb20gJy4vRG9jc1BhZ2UnXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXG5cdGRlZiByb290XG5cdFx0QG93bmVyXyA/IEBvd25lcl8ucm9vdCA6IHNlbGZcblxuXHRkZWYgYXBwXG5cdFx0cm9vdC5hcHBcblxuXG5leHBvcnQgdGFnIFNpdGVcblx0XG5cdGRlZiBhcHBcblx0XHRkYXRhXG5cdFx0XG5cdGRlZiByb290XG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcm91dGVyXG5cdFx0YXBwLnJvdXRlclxuXHRcdFxuXHRkZWYgbG9hZFxuXHRcdGNvbnNvbGUubG9nIFwibG9hZGluZyBhcHAucm91dGVyXCJcblx0XHRQcm9taXNlLm5ldyBkbyB8cmVzb2x2ZXxcblx0XHRcdGNvbnNvbGUubG9nIFwiU2l0ZSNsb2FkXCJcblx0XHRcdHNldFRpbWVvdXQocmVzb2x2ZSwyMDApXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRjb25zb2xlLmxvZyBcInJlbmRlciBzaXRlXCIsYXBwLnBhdGhcblx0XHQ8c2VsZj5cblx0XHRcdDxoZWFkZXIjaGVhZGVyPlxuXHRcdFx0XHQ8bmF2LmNvbnRlbnQ+XG5cdFx0XHRcdFx0PGEudGFiLmxvZ28gaHJlZj0nL2hvbWUnPiA8aT4gJ2ltYmEnXG5cdFx0XHRcdFx0PHNwYW4uZ3JlZWR5PlxuXHRcdFx0XHRcdDxhLnRhYi5ob21lIGhyZWY9Jy9ob21lJz4gPGk+ICdob21lJ1xuXHRcdFx0XHRcdDxhLnRhYi5ndWlkZXMgaHJlZj0nL2d1aWRlJz4gPGk+ICdsZWFybidcblx0XHRcdFx0XHQ8YS50YWIuZG9jcyBocmVmPScvZG9jcyc+IDxpPiAnYXBpJ1xuXHRcdFx0XHRcdDxhLnR3aXR0ZXIgaHJlZj0naHR0cDovL3R3aXR0ZXIuY29tL2ltYmFqcyc+IDxpPiAndHdpdHRlcidcblx0XHRcdFx0XHQ8YS5naXRodWIgaHJlZj0naHR0cHM6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYSc+IDxpPiAnZ2l0aHViJ1xuXHRcdFx0XHRcdDxhLmlzc3VlcyBocmVmPSdodHRwczovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhL2lzc3Vlcyc+IDxpPiAnaXNzdWVzJ1xuXHRcdFx0XHRcdDxhLm1lbnUgOnRhcD0ndG9nZ2xlTWVudSc+IDxiPlxuXHRcdFx0XG5cdFx0XHQ8bWFpbj5cblx0XHRcdFx0aWYgcm91dGVyLnNjb3BlZCgnL2hvbWUnKVxuXHRcdFx0XHRcdDxIb21lUGFnZT5cblx0XHRcdFx0ZWxpZiByb3V0ZXIuc2NvcGVkKCcvZ3VpZGUnKVxuXHRcdFx0XHRcdDxHdWlkZXNQYWdlW2FwcC5ndWlkZV0+XG5cdFx0XHRcdGVsaWYgcm91dGVyLnNjb3BlZCgnL2RvY3MnKVxuXHRcdFx0XHRcdDxEb2NzUGFnZT5cblxuXHRcdFx0PGZvb3RlciNmb290ZXI+IFxuXHRcdFx0XHQ8aHI+XG5cdFx0XHRcdDwubGZ0PiBcIkltYmEgwqkgMjAxNS0yMDE4XCJcblx0XHRcdFx0PC5yZ3Q+XG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL3R3aXR0ZXIuY29tL2ltYmFqcyc+ICdUd2l0dGVyJ1xuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYSc+ICdHaXRIdWInXG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhL2lzc3Vlcyc+ICdJc3N1ZXMnXG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL2dpdHRlci5pbS9zb21lYmVlL2ltYmEnPiAnQ2hhdCdcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9TaXRlLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5cbmltcG9ydCBFeGFtcGxlIGZyb20gJy4vU25pcHBldCdcbmltcG9ydCBNYXJrZWQgZnJvbSAnLi9NYXJrZWQnXG5pbXBvcnQgUGF0dGVybiBmcm9tICcuL1BhdHRlcm4nXG5cblxuZXhwb3J0IHRhZyBIb21lUGFnZSA8IFBhZ2VcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+IDwuYm9keT5cblx0XHRcdDxkaXYjaGVyby5kYXJrPlxuXHRcdFx0XHQ8UGF0dGVybkBwYXR0ZXJuPlxuXHRcdFx0XHQjIDxoZXJvc25pcHBldC5oZXJvLmRhcmsgc3JjPScvaG9tZS9leGFtcGxlcy9oZXJvLmltYmEnPlxuXHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQud2VsY29tZS5odWdlLmxpZ2h0PiBcIlwiXCJcblx0XHRcdFx0XHQjIENyZWF0ZSBjb21wbGV4IHdlYiBhcHBzIHdpdGggZWFzZSFcblxuXHRcdFx0XHRcdEltYmEgaXMgYSBuZXcgcHJvZ3JhbW1pbmcgbGFuZ3VhZ2UgZm9yIHRoZSB3ZWIgdGhhdCBjb21waWxlcyB0byBoaWdobHkgXG5cdFx0XHRcdFx0cGVyZm9ybWFudCBhbmQgcmVhZGFibGUgSmF2YVNjcmlwdC4gSXQgaGFzIGxhbmd1YWdlIGxldmVsIHN1cHBvcnQgZm9yIGRlZmluaW5nLCBcblx0XHRcdFx0XHRleHRlbmRpbmcsIHN1YmNsYXNzaW5nLCBpbnN0YW50aWF0aW5nIGFuZCByZW5kZXJpbmcgZG9tIG5vZGVzLiBGb3IgYSBzaW1wbGUgXG5cdFx0XHRcdFx0YXBwbGljYXRpb24gbGlrZSBUb2RvTVZDLCBpdCBpcyBtb3JlIHRoYW4gXG5cdFx0XHRcdFx0WzEwIHRpbWVzIGZhc3RlciB0aGFuIFJlYWN0XShodHRwOi8vc29tZWJlZS5naXRodWIuaW8vdG9kb212Yy1yZW5kZXItYmVuY2htYXJrL2luZGV4Lmh0bWwpIFxuXHRcdFx0XHRcdHdpdGggbGVzcyBjb2RlLCBhbmQgYSBtdWNoIHNtYWxsZXIgbGlicmFyeS5cblxuXHRcdFx0XHRcdC0tLVxuXG5cdFx0XHRcdFx0LSAjIyBJbWJhLmluc3BpcmF0aW9uXG5cdFx0XHRcdFx0ICBJbWJhIGJyaW5ncyB0aGUgYmVzdCBmcm9tIFJ1YnksIFB5dGhvbiwgYW5kIFJlYWN0ICgrIEpTWCkgdG9nZXRoZXIgaW4gYSBjbGVhbiBsYW5ndWFnZSBhbmQgcnVudGltZS5cblxuXHRcdFx0XHRcdC0gIyMgSW1iYS5pbnRlcm9wZXJhYmlsaXR5XG5cdFx0XHRcdFx0ICBJbWJhIGNvbXBpbGVzIGRvd24gdG8gY2xlYW4gYW5kIHJlYWRhYmxlIEphdmFTY3JpcHQuIFVzZSBhbnkgSlMgbGlicmFyeSBpbiBJbWJhIGFuZCB2aWNhLXZlcnNhLlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC0gIyMgSW1iYS5wZXJmb3JtYW5jZVxuXHRcdFx0XHRcdCAgQnVpbGQgeW91ciBhcHBsaWNhdGlvbiB2aWV3cyB1c2luZyBJbWJhJ3MgbmF0aXZlIHRhZ3MgZm9yIHVucHJlY2VkZW50ZWQgcGVyZm9ybWFuY2UuXG5cblx0XHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0XHQjIDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIlNpbXBsZSByZW1pbmRlcnNcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL3JlbWluZGVycy5pbWJhJz5cblxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMjIFJldXNhYmxlIGNvbXBvbmVudHNcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRBIGN1c3RvbSB0YWcgLyBjb21wb25lbnQgY2FuIG1haW50YWluIGludGVybmFsIHN0YXRlIGFuZCBjb250cm9sIGhvdyB0byByZW5kZXIgaXRzZWxmLlxuXHRcdFx0XHRcdFdpdGggdGhlIHBlcmZvcm1hbmNlIG9mIERPTSByZWNvbmNpbGlhdGlvbiBpbiBJbWJhLCB5b3UgY2FuIHVzZSBvbmUtd2F5IGRlY2xhcmF0aXZlIGJpbmRpbmdzLFxuXHRcdFx0XHRcdGV2ZW4gZm9yIGFuaW1hdGlvbnMuIFdyaXRlIGFsbCB5b3VyIHZpZXdzIGluIGEgc3RyYWlnaHQtZm9yd2FyZCBsaW5lYXIgZmFzaGlvbiBhcyBpZiB5b3UgY291bGRcblx0XHRcdFx0XHRyZXJlbmRlciB5b3VyIHdob2xlIGFwcGxpY2F0aW9uIG9uICoqZXZlcnkgc2luZ2xlKiogZGF0YS9zdGF0ZSBjaGFuZ2UuXG5cdFx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdFx0IyA8RXhhbXBsZS5kYXJrIGhlYWRpbmc9XCJXb3JsZCBjbG9ja1wiIHNyYz0nL2hvbWUvZXhhbXBsZXMvY2xvY2suaW1iYSc+XG5cblx0XHRcdFx0PE1hcmtlZC5zZWN0aW9uLm1kPiBcIlwiXCJcblx0XHRcdFx0XHQjIyBFeHRlbmQgbmF0aXZlIHRhZ3Ncblx0XHRcdFx0XHRcblx0XHRcdFx0XHRJbiBhZGRpdGlvbiB0byBkZWZpbmluZyBjdXN0b20gdGFncywgeW91IGNhbiBhbHNvIGV4dGVuZCBuYXRpdmUgdGFncywgb3IgaW5oZXJpdCBmcm9tIHRoZW0uXG5cdFx0XHRcdFx0QmluZGluZyB0byBkb20gZXZlbnRzIGlzIGFzIHNpbXBsZSBhcyBkZWZpbmluZyBtZXRob2RzIG9uIHlvdXIgdGFnczsgYWxsIGV2ZW50cyB3aWxsIGJlXG5cdFx0XHRcdFx0ZWZmaWNpZW50bHkgZGVsZWdhdGVkIGFuZCBoYW5kbGVkIGJ5IEltYmEuIExldCdzIGRlZmluZSBhIHNpbXBsZSBza2V0Y2hwYWQuLi5cblx0XHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0XHQjIDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIkN1c3RvbSBjYW52YXNcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL2NhbnZhcy5pbWJhJz5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIiMgZGVmaW5lIHJlbmRlcmVyXG52YXIgbWFya2VkID0gcmVxdWlyZSAnbWFya2VkJ1xudmFyIG1kciA9IG1hcmtlZC5SZW5kZXJlci5uZXdcblxuZGVmIG1kci5oZWFkaW5nIHRleHQsIGx2bFxuXHRcIjxoe2x2bH0+e3RleHR9PC9oe2x2bH0+XCJcblx0XHRcbmV4cG9ydCB0YWcgTWFya2VkXG5cdGRlZiByZW5kZXJlclxuXHRcdHNlbGZcblxuXHRkZWYgc2V0VGV4dCB0ZXh0XG5cdFx0aWYgdGV4dCAhPSBAdGV4dFxuXHRcdFx0QHRleHQgPSB0ZXh0XG5cdFx0XHRkb206aW5uZXJIVE1MID0gbWFya2VkKHRleHQsIHJlbmRlcmVyOiBtZHIpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZXRDb250ZW50IHZhbCx0eXBcblx0XHRzZXRUZXh0KHZhbCwwKVxuXHRcdHJldHVybiBzZWxmXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9NYXJrZWQuaW1iYSIsIi8qKlxuICogbWFya2VkIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0LCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkXG4gKi9cblxuOyhmdW5jdGlvbigpIHtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBCbG9jay1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGJsb2NrID0ge1xuICBuZXdsaW5lOiAvXlxcbisvLFxuICBjb2RlOiAvXiggezR9W15cXG5dK1xcbiopKy8sXG4gIGZlbmNlczogbm9vcCxcbiAgaHI6IC9eKCAqWy0qX10pezMsfSAqKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSAqKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvLFxuICBucHRhYmxlOiBub29wLFxuICBsaGVhZGluZzogL14oW15cXG5dKylcXG4gKig9fC0pezIsfSAqKD86XFxuK3wkKS8sXG4gIGJsb2NrcXVvdGU6IC9eKCAqPlteXFxuXSsoXFxuKD8hZGVmKVteXFxuXSspKlxcbiopKy8sXG4gIGxpc3Q6IC9eKCAqKShidWxsKSBbXFxzXFxTXSs/KD86aHJ8ZGVmfFxcbnsyLH0oPyEgKSg/IVxcMWJ1bGwgKVxcbip8XFxzKiQpLyxcbiAgaHRtbDogL14gKig/OmNvbW1lbnQgKig/OlxcbnxcXHMqJCl8Y2xvc2VkICooPzpcXG57Mix9fFxccyokKXxjbG9zaW5nICooPzpcXG57Mix9fFxccyokKSkvLFxuICBkZWY6IC9eICpcXFsoW15cXF1dKylcXF06ICo8PyhbXlxccz5dKyk+Pyg/OiArW1wiKF0oW15cXG5dKylbXCIpXSk/ICooPzpcXG4rfCQpLyxcbiAgdGFibGU6IG5vb3AsXG4gIHBhcmFncmFwaDogL14oKD86W15cXG5dK1xcbj8oPyFocnxoZWFkaW5nfGxoZWFkaW5nfGJsb2NrcXVvdGV8dGFnfGRlZikpKylcXG4qLyxcbiAgdGV4dDogL15bXlxcbl0rL1xufTtcblxuYmxvY2suYnVsbGV0ID0gLyg/OlsqKy1dfFxcZCtcXC4pLztcbmJsb2NrLml0ZW0gPSAvXiggKikoYnVsbCkgW15cXG5dKig/Olxcbig/IVxcMWJ1bGwgKVteXFxuXSopKi87XG5ibG9jay5pdGVtID0gcmVwbGFjZShibG9jay5pdGVtLCAnZ20nKVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoKTtcblxuYmxvY2subGlzdCA9IHJlcGxhY2UoYmxvY2subGlzdClcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCdocicsICdcXFxcbisoPz1cXFxcMT8oPzpbLSpfXSAqKXszLH0oPzpcXFxcbit8JCkpJylcbiAgKCdkZWYnLCAnXFxcXG4rKD89JyArIGJsb2NrLmRlZi5zb3VyY2UgKyAnKScpXG4gICgpO1xuXG5ibG9jay5ibG9ja3F1b3RlID0gcmVwbGFjZShibG9jay5ibG9ja3F1b3RlKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbmJsb2NrLl90YWcgPSAnKD8hKD86J1xuICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZSdcbiAgKyAnfHZhcnxzYW1wfGtiZHxzdWJ8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvJ1xuICArICd8c3Bhbnxicnx3YnJ8aW5zfGRlbHxpbWcpXFxcXGIpXFxcXHcrKD8hOi98W15cXFxcd1xcXFxzQF0qQClcXFxcYic7XG5cbmJsb2NrLmh0bWwgPSByZXBsYWNlKGJsb2NrLmh0bWwpXG4gICgnY29tbWVudCcsIC88IS0tW1xcc1xcU10qPy0tPi8pXG4gICgnY2xvc2VkJywgLzwodGFnKVtcXHNcXFNdKz88XFwvXFwxPi8pXG4gICgnY2xvc2luZycsIC88dGFnKD86XCJbXlwiXSpcInwnW14nXSonfFteJ1wiPl0pKj8+LylcbiAgKC90YWcvZywgYmxvY2suX3RhZylcbiAgKCk7XG5cbmJsb2NrLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJ2hyJywgYmxvY2suaHIpXG4gICgnaGVhZGluZycsIGJsb2NrLmhlYWRpbmcpXG4gICgnbGhlYWRpbmcnLCBibG9jay5saGVhZGluZylcbiAgKCdibG9ja3F1b3RlJywgYmxvY2suYmxvY2txdW90ZSlcbiAgKCd0YWcnLCAnPCcgKyBibG9jay5fdGFnKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5ub3JtYWwgPSBtZXJnZSh7fSwgYmxvY2spO1xuXG4vKipcbiAqIEdGTSBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2suZ2ZtID0gbWVyZ2Uoe30sIGJsb2NrLm5vcm1hbCwge1xuICBmZW5jZXM6IC9eICooYHszLH18fnszLH0pWyBcXC5dKihcXFMrKT8gKlxcbihbXFxzXFxTXSo/KVxccypcXDEgKig/Olxcbit8JCkvLFxuICBwYXJhZ3JhcGg6IC9eLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICsoW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS9cbn0pO1xuXG5ibG9jay5nZm0ucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnKD8hJywgJyg/ISdcbiAgICArIGJsb2NrLmdmbS5mZW5jZXMuc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwyJykgKyAnfCdcbiAgICArIGJsb2NrLmxpc3Quc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwzJykgKyAnfCcpXG4gICgpO1xuXG4vKipcbiAqIEdGTSArIFRhYmxlcyBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2sudGFibGVzID0gbWVyZ2Uoe30sIGJsb2NrLmdmbSwge1xuICBucHRhYmxlOiAvXiAqKFxcUy4qXFx8LiopXFxuICooWy06XSsgKlxcfFstfCA6XSopXFxuKCg/Oi4qXFx8LiooPzpcXG58JCkpKilcXG4qLyxcbiAgdGFibGU6IC9eICpcXHwoLispXFxuICpcXHwoICpbLTpdK1stfCA6XSopXFxuKCg/OiAqXFx8LiooPzpcXG58JCkpKilcXG4qL1xufSk7XG5cbi8qKlxuICogQmxvY2sgTGV4ZXJcbiAqL1xuXG5mdW5jdGlvbiBMZXhlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW5zLmxpbmtzID0ge307XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLnJ1bGVzID0gYmxvY2subm9ybWFsO1xuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50YWJsZXMpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay50YWJsZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay5nZm07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIEJsb2NrIFJ1bGVzXG4gKi9cblxuTGV4ZXIucnVsZXMgPSBibG9jaztcblxuLyoqXG4gKiBTdGF0aWMgTGV4IE1ldGhvZFxuICovXG5cbkxleGVyLmxleCA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucykge1xuICB2YXIgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gIHJldHVybiBsZXhlci5sZXgoc3JjKTtcbn07XG5cbi8qKlxuICogUHJlcHJvY2Vzc2luZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS5sZXggPSBmdW5jdGlvbihzcmMpIHtcbiAgc3JjID0gc3JjXG4gICAgLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpXG4gICAgLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpXG4gICAgLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKVxuICAgIC5yZXBsYWNlKC9cXHUyNDI0L2csICdcXG4nKTtcblxuICByZXR1cm4gdGhpcy50b2tlbihzcmMsIHRydWUpO1xufTtcblxuLyoqXG4gKiBMZXhpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUudG9rZW4gPSBmdW5jdGlvbihzcmMsIHRvcCwgYnEpIHtcbiAgdmFyIHNyYyA9IHNyYy5yZXBsYWNlKC9eICskL2dtLCAnJylcbiAgICAsIG5leHRcbiAgICAsIGxvb3NlXG4gICAgLCBjYXBcbiAgICAsIGJ1bGxcbiAgICAsIGJcbiAgICAsIGl0ZW1cbiAgICAsIHNwYWNlXG4gICAgLCBpXG4gICAgLCBsO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBuZXdsaW5lXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubmV3bGluZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzBdLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ3NwYWNlJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiB7NH0vZ20sICcnKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIHRleHQ6ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICA/IGNhcC5yZXBsYWNlKC9cXG4rJC8sICcnKVxuICAgICAgICAgIDogY2FwXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGZlbmNlcyAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmZlbmNlcy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICBsYW5nOiBjYXBbMl0sXG4gICAgICAgIHRleHQ6IGNhcFszXSB8fCAnJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgdGV4dDogY2FwWzJdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIG5vIGxlYWRpbmcgcGlwZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMubnB0YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXS5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxoZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMl0gPT09ICc9JyA/IDEgOiAyLFxuICAgICAgICB0ZXh0OiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oci5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hyJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBibG9ja3F1b3RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYmxvY2txdW90ZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9zdGFydCdcbiAgICAgIH0pO1xuXG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiAqPiA/L2dtLCAnJyk7XG5cbiAgICAgIC8vIFBhc3MgYHRvcGAgdG8ga2VlcCB0aGUgY3VycmVudFxuICAgICAgLy8gXCJ0b3BsZXZlbFwiIHN0YXRlLiBUaGlzIGlzIGV4YWN0bHlcbiAgICAgIC8vIGhvdyBtYXJrZG93bi5wbCB3b3Jrcy5cbiAgICAgIHRoaXMudG9rZW4oY2FwLCB0b3AsIHRydWUpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpc3RcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saXN0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGJ1bGwgPSBjYXBbMl07XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9zdGFydCcsXG4gICAgICAgIG9yZGVyZWQ6IGJ1bGwubGVuZ3RoID4gMVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEdldCBlYWNoIHRvcC1sZXZlbCBpdGVtLlxuICAgICAgY2FwID0gY2FwWzBdLm1hdGNoKHRoaXMucnVsZXMuaXRlbSk7XG5cbiAgICAgIG5leHQgPSBmYWxzZTtcbiAgICAgIGwgPSBjYXAubGVuZ3RoO1xuICAgICAgaSA9IDA7XG5cbiAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBjYXBbaV07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0IGl0ZW0ncyBidWxsZXRcbiAgICAgICAgLy8gc28gaXQgaXMgc2VlbiBhcyB0aGUgbmV4dCB0b2tlbi5cbiAgICAgICAgc3BhY2UgPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXiAqKFsqKy1dfFxcZCtcXC4pICsvLCAnJyk7XG5cbiAgICAgICAgLy8gT3V0ZGVudCB3aGF0ZXZlciB0aGVcbiAgICAgICAgLy8gbGlzdCBpdGVtIGNvbnRhaW5zLiBIYWNreS5cbiAgICAgICAgaWYgKH5pdGVtLmluZGV4T2YoJ1xcbiAnKSkge1xuICAgICAgICAgIHNwYWNlIC09IGl0ZW0ubGVuZ3RoO1xuICAgICAgICAgIGl0ZW0gPSAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgICA/IGl0ZW0ucmVwbGFjZShuZXcgUmVnRXhwKCdeIHsxLCcgKyBzcGFjZSArICd9JywgJ2dtJyksICcnKVxuICAgICAgICAgICAgOiBpdGVtLnJlcGxhY2UoL14gezEsNH0vZ20sICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBuZXh0IGxpc3QgaXRlbSBiZWxvbmdzIGhlcmUuXG4gICAgICAgIC8vIEJhY2twZWRhbCBpZiBpdCBkb2VzIG5vdCBiZWxvbmcgaW4gdGhpcyBsaXN0LlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNtYXJ0TGlzdHMgJiYgaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBiID0gYmxvY2suYnVsbGV0LmV4ZWMoY2FwW2kgKyAxXSlbMF07XG4gICAgICAgICAgaWYgKGJ1bGwgIT09IGIgJiYgIShidWxsLmxlbmd0aCA+IDEgJiYgYi5sZW5ndGggPiAxKSkge1xuICAgICAgICAgICAgc3JjID0gY2FwLnNsaWNlKGkgKyAxKS5qb2luKCdcXG4nKSArIHNyYztcbiAgICAgICAgICAgIGkgPSBsIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciBpdGVtIGlzIGxvb3NlIG9yIG5vdC5cbiAgICAgICAgLy8gVXNlOiAvKF58XFxuKSg/ISApW15cXG5dK1xcblxcbig/IVxccyokKS9cbiAgICAgICAgLy8gZm9yIGRpc2NvdW50IGJlaGF2aW9yLlxuICAgICAgICBsb29zZSA9IG5leHQgfHwgL1xcblxcbig/IVxccyokKS8udGVzdChpdGVtKTtcbiAgICAgICAgaWYgKGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgbmV4dCA9IGl0ZW0uY2hhckF0KGl0ZW0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nO1xuICAgICAgICAgIGlmICghbG9vc2UpIGxvb3NlID0gbmV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6IGxvb3NlXG4gICAgICAgICAgICA/ICdsb29zZV9pdGVtX3N0YXJ0J1xuICAgICAgICAgICAgOiAnbGlzdF9pdGVtX3N0YXJ0J1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWN1cnNlLlxuICAgICAgICB0aGlzLnRva2VuKGl0ZW0sIGZhbHNlLCBicSk7XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2xpc3RfaXRlbV9lbmQnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3RfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGh0bWxcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5odG1sLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgICA/ICdwYXJhZ3JhcGgnXG4gICAgICAgICAgOiAnaHRtbCcsXG4gICAgICAgIHByZTogIXRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAmJiAoY2FwWzFdID09PSAncHJlJyB8fCBjYXBbMV0gPT09ICdzY3JpcHQnIHx8IGNhcFsxXSA9PT0gJ3N0eWxlJyksXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWZcbiAgICBpZiAoKCFicSAmJiB0b3ApICYmIChjYXAgPSB0aGlzLnJ1bGVzLmRlZi5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMubGlua3NbY2FwWzFdLnRvTG93ZXJDYXNlKCldID0ge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMudGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvKD86ICpcXHwgKik/XFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV1cbiAgICAgICAgICAucmVwbGFjZSgvXiAqXFx8ICp8ICpcXHwgKiQvZywgJycpXG4gICAgICAgICAgLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnBhcmFncmFwaC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICB0ZXh0OiBjYXBbMV0uY2hhckF0KGNhcFsxXS5sZW5ndGggLSAxKSA9PT0gJ1xcbidcbiAgICAgICAgICA/IGNhcFsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIC8vIFRvcC1sZXZlbCBzaG91bGQgbmV2ZXIgcmVhY2ggaGVyZS5cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBpbmxpbmUgPSB7XG4gIGVzY2FwZTogL15cXFxcKFtcXFxcYCp7fVxcW1xcXSgpIytcXC0uIV8+XSkvLFxuICBhdXRvbGluazogL148KFteIDw+XSsoQHw6XFwvKVteIDw+XSspPi8sXG4gIHVybDogbm9vcCxcbiAgdGFnOiAvXjwhLS1bXFxzXFxTXSo/LS0+fF48XFwvP1xcdysoPzpcIlteXCJdKlwifCdbXiddKid8W148J1wiPl0pKj8+LyxcbiAgbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFwoaHJlZlxcKS8sXG4gIHJlZmxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxccypcXFsoW15cXF1dKilcXF0vLFxuICBub2xpbms6IC9eIT9cXFsoKD86XFxbW15cXF1dKlxcXXxbXlxcW1xcXV0pKilcXF0vLFxuICBzdHJvbmc6IC9eX18oW1xcc1xcU10rPylfXyg/IV8pfF5cXCpcXCooW1xcc1xcU10rPylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXFxiXygoPzpbXl9dfF9fKSs/KV9cXGJ8XlxcKigoPzpcXCpcXCp8W1xcc1xcU10pKz8pXFwqKD8hXFwqKS8sXG4gIGNvZGU6IC9eKGArKShbXFxzXFxTXSo/W15gXSlcXDEoPyFgKS8sXG4gIGJyOiAvXiB7Mix9XFxuKD8hXFxzKiQpLyxcbiAgZGVsOiBub29wLFxuICB0ZXh0OiAvXltcXHNcXFNdKz8oPz1bXFxcXDwhXFxbXypgXXwgezIsfVxcbnwkKS9cbn07XG5cbmlubGluZS5faW5zaWRlID0gLyg/OlxcW1teXFxdXSpcXF18XFxcXFtcXFtcXF1dfFteXFxbXFxdXXxcXF0oPz1bXlxcW10qXFxdKSkqLztcbmlubGluZS5faHJlZiA9IC9cXHMqPD8oW1xcc1xcU10qPyk+Pyg/OlxccytbJ1wiXShbXFxzXFxTXSo/KVsnXCJdKT9cXHMqLztcblxuaW5saW5lLmxpbmsgPSByZXBsYWNlKGlubGluZS5saW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gICgpO1xuXG5pbmxpbmUucmVmbGluayA9IHJlcGxhY2UoaW5saW5lLnJlZmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5ub3JtYWwgPSBtZXJnZSh7fSwgaW5saW5lKTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIHN0cm9uZzogL15fXyg/PVxcUykoW1xcc1xcU10qP1xcUylfXyg/IV8pfF5cXCpcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pfF5cXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqKD8hXFwqKS9cbn0pO1xuXG4vKipcbiAqIEdGTSBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5nZm0gPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBlc2NhcGU6IHJlcGxhY2UoaW5saW5lLmVzY2FwZSkoJ10pJywgJ358XSknKSgpLFxuICB1cmw6IC9eKGh0dHBzPzpcXC9cXC9bXlxcczxdK1tePC4sOjtcIicpXFxdXFxzXSkvLFxuICBkZWw6IC9efn4oPz1cXFMpKFtcXHNcXFNdKj9cXFMpfn4vLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS50ZXh0KVxuICAgICgnXXwnLCAnfl18JylcbiAgICAoJ3wnLCAnfGh0dHBzPzovL3wnKVxuICAgICgpXG59KTtcblxuLyoqXG4gKiBHRk0gKyBMaW5lIEJyZWFrcyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5icmVha3MgPSBtZXJnZSh7fSwgaW5saW5lLmdmbSwge1xuICBicjogcmVwbGFjZShpbmxpbmUuYnIpKCd7Mix9JywgJyonKSgpLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS5nZm0udGV4dCkoJ3syLH0nLCAnKicpKClcbn0pO1xuXG4vKipcbiAqIElubGluZSBMZXhlciAmIENvbXBpbGVyXG4gKi9cblxuZnVuY3Rpb24gSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMubGlua3MgPSBsaW5rcztcbiAgdGhpcy5ydWxlcyA9IGlubGluZS5ub3JtYWw7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgaWYgKCF0aGlzLmxpbmtzKSB7XG4gICAgdGhyb3cgbmV3XG4gICAgICBFcnJvcignVG9rZW5zIGFycmF5IHJlcXVpcmVzIGEgYGxpbmtzYCBwcm9wZXJ0eS4nKTtcbiAgfVxuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuYnJlYWtzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmdmbTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgdGhpcy5ydWxlcyA9IGlubGluZS5wZWRhbnRpYztcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBJbmxpbmUgUnVsZXNcbiAqL1xuXG5JbmxpbmVMZXhlci5ydWxlcyA9IGlubGluZTtcblxuLyoqXG4gKiBTdGF0aWMgTGV4aW5nL0NvbXBpbGluZyBNZXRob2RcbiAqL1xuXG5JbmxpbmVMZXhlci5vdXRwdXQgPSBmdW5jdGlvbihzcmMsIGxpbmtzLCBvcHRpb25zKSB7XG4gIHZhciBpbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpO1xuICByZXR1cm4gaW5saW5lLm91dHB1dChzcmMpO1xufTtcblxuLyoqXG4gKiBMZXhpbmcvQ29tcGlsaW5nXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uKHNyYykge1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGxpbmtcbiAgICAsIHRleHRcbiAgICAsIGhyZWZcbiAgICAsIGNhcDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gZXNjYXBlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZXNjYXBlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSBjYXBbMV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBhdXRvbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmF1dG9saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKFxuICAgICAgICAgIGNhcFsxXS5jaGFyQXQoNikgPT09ICc6J1xuICAgICAgICAgID8gdGhpcy5tYW5nbGUoY2FwWzFdLnN1YnN0cmluZyg3KSlcbiAgICAgICAgICA6IHRoaXMubWFuZ2xlKGNhcFsxXSlcbiAgICAgICAgKTtcbiAgICAgICAgaHJlZiA9IHRoaXMubWFuZ2xlKCdtYWlsdG86JykgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB1cmwgKGdmbSlcbiAgICBpZiAoIXRoaXMuaW5MaW5rICYmIChjYXAgPSB0aGlzLnJ1bGVzLnVybC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFnXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGFnLmV4ZWMoc3JjKSkge1xuICAgICAgaWYgKCF0aGlzLmluTGluayAmJiAvXjxhIC9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5MaW5rICYmIC9ePFxcL2E+L2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKVxuICAgICAgICAgIDogZXNjYXBlKGNhcFswXSlcbiAgICAgICAgOiBjYXBbMF1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfSk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgaWYgKChjYXAgPSB0aGlzLnJ1bGVzLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICB8fCAoY2FwID0gdGhpcy5ydWxlcy5ub2xpbmsuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGxpbmsgPSAoY2FwWzJdIHx8IGNhcFsxXSkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgbGluayA9IHRoaXMubGlua3NbbGluay50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmICghbGluayB8fCAhbGluay5ocmVmKSB7XG4gICAgICAgIG91dCArPSBjYXBbMF0uY2hhckF0KDApO1xuICAgICAgICBzcmMgPSBjYXBbMF0uc3Vic3RyaW5nKDEpICsgc3JjO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCBsaW5rKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBzdHJvbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5zdHJvbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuc3Ryb25nKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGVtXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZW0uZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZW0odGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuY29kZXNwYW4oZXNjYXBlKGNhcFsyXS50cmltKCksIHRydWUpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYnIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuYnIoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlbCAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmRlbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5kZWwodGhpcy5vdXRwdXQoY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50ZXh0KGVzY2FwZSh0aGlzLnNtYXJ0eXBhbnRzKGNhcFswXSkpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvbXBpbGUgTGlua1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXRMaW5rID0gZnVuY3Rpb24oY2FwLCBsaW5rKSB7XG4gIHZhciBocmVmID0gZXNjYXBlKGxpbmsuaHJlZilcbiAgICAsIHRpdGxlID0gbGluay50aXRsZSA/IGVzY2FwZShsaW5rLnRpdGxlKSA6IG51bGw7XG5cbiAgcmV0dXJuIGNhcFswXS5jaGFyQXQoMCkgIT09ICchJ1xuICAgID8gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIHRpdGxlLCB0aGlzLm91dHB1dChjYXBbMV0pKVxuICAgIDogdGhpcy5yZW5kZXJlci5pbWFnZShocmVmLCB0aXRsZSwgZXNjYXBlKGNhcFsxXSkpO1xufTtcblxuLyoqXG4gKiBTbWFydHlwYW50cyBUcmFuc2Zvcm1hdGlvbnNcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUuc21hcnR5cGFudHMgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLnNtYXJ0eXBhbnRzKSByZXR1cm4gdGV4dDtcbiAgcmV0dXJuIHRleHRcbiAgICAvLyBlbS1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0tL2csICdcXHUyMDE0JylcbiAgICAvLyBlbi1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0vZywgJ1xcdTIwMTMnKVxuICAgIC8vIG9wZW5pbmcgc2luZ2xlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JylcbiAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8nL2csICdcXHUyMDE5JylcbiAgICAvLyBvcGVuaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XFx1MjAxOFxcc10pXCIvZywgJyQxXFx1MjAxYycpXG4gICAgLy8gY2xvc2luZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJylcbiAgICAvLyBlbGxpcHNlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTtcbn07XG5cbi8qKlxuICogTWFuZ2xlIExpbmtzXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm1hbmdsZSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMubWFuZ2xlKSByZXR1cm4gdGV4dDtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsID0gdGV4dC5sZW5ndGhcbiAgICAsIGkgPSAwXG4gICAgLCBjaDtcblxuICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgIGNoID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICBjaCA9ICd4JyArIGNoLnRvU3RyaW5nKDE2KTtcbiAgICB9XG4gICAgb3V0ICs9ICcmIycgKyBjaCArICc7JztcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cblxuZnVuY3Rpb24gUmVuZGVyZXIob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xufVxuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZSA9IGZ1bmN0aW9uKGNvZGUsIGxhbmcsIGVzY2FwZWQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICB2YXIgb3V0ID0gdGhpcy5vcHRpb25zLmhpZ2hsaWdodChjb2RlLCBsYW5nKTtcbiAgICBpZiAob3V0ICE9IG51bGwgJiYgb3V0ICE9PSBjb2RlKSB7XG4gICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICAgIGNvZGUgPSBvdXQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFsYW5nKSB7XG4gICAgcmV0dXJuICc8cHJlPjxjb2RlPidcbiAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgKyAnXFxuPC9jb2RlPjwvcHJlPic7XG4gIH1cblxuICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMubGFuZ1ByZWZpeFxuICAgICsgZXNjYXBlKGxhbmcsIHRydWUpXG4gICAgKyAnXCI+J1xuICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICsgJ1xcbjwvY29kZT48L3ByZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJsb2NrcXVvdGUgPSBmdW5jdGlvbihxdW90ZSkge1xuICByZXR1cm4gJzxibG9ja3F1b3RlPlxcbicgKyBxdW90ZSArICc8L2Jsb2NrcXVvdGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICByZXR1cm4gaHRtbDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5oZWFkaW5nID0gZnVuY3Rpb24odGV4dCwgbGV2ZWwsIHJhdykge1xuICByZXR1cm4gJzxoJ1xuICAgICsgbGV2ZWxcbiAgICArICcgaWQ9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMuaGVhZGVyUHJlZml4XG4gICAgKyByYXcudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd10rL2csICctJylcbiAgICArICdcIj4nXG4gICAgKyB0ZXh0XG4gICAgKyAnPC9oJ1xuICAgICsgbGV2ZWxcbiAgICArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ociA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxoci8+XFxuJyA6ICc8aHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24oYm9keSwgb3JkZXJlZCkge1xuICB2YXIgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJztcbiAgcmV0dXJuICc8JyArIHR5cGUgKyAnPlxcbicgKyBib2R5ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdGl0ZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGxpPicgKyB0ZXh0ICsgJzwvbGk+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5wYXJhZ3JhcGggPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHA+JyArIHRleHQgKyAnPC9wPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGUgPSBmdW5jdGlvbihoZWFkZXIsIGJvZHkpIHtcbiAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICsgJzx0aGVhZD5cXG4nXG4gICAgKyBoZWFkZXJcbiAgICArICc8L3RoZWFkPlxcbidcbiAgICArICc8dGJvZHk+XFxuJ1xuICAgICsgYm9keVxuICAgICsgJzwvdGJvZHk+XFxuJ1xuICAgICsgJzwvdGFibGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZXJvdyA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgcmV0dXJuICc8dHI+XFxuJyArIGNvbnRlbnQgKyAnPC90cj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlY2VsbCA9IGZ1bmN0aW9uKGNvbnRlbnQsIGZsYWdzKSB7XG4gIHZhciB0eXBlID0gZmxhZ3MuaGVhZGVyID8gJ3RoJyA6ICd0ZCc7XG4gIHZhciB0YWcgPSBmbGFncy5hbGlnblxuICAgID8gJzwnICsgdHlwZSArICcgc3R5bGU9XCJ0ZXh0LWFsaWduOicgKyBmbGFncy5hbGlnbiArICdcIj4nXG4gICAgOiAnPCcgKyB0eXBlICsgJz4nO1xuICByZXR1cm4gdGFnICsgY29udGVudCArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuLy8gc3BhbiBsZXZlbCByZW5kZXJlclxuUmVuZGVyZXIucHJvdG90eXBlLnN0cm9uZyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8c3Ryb25nPicgKyB0ZXh0ICsgJzwvc3Ryb25nPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGVtPicgKyB0ZXh0ICsgJzwvZW0+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2Rlc3BhbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8Y29kZT4nICsgdGV4dCArICc8L2NvZGU+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5iciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxici8+JyA6ICc8YnI+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5kZWwgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGRlbD4nICsgdGV4dCArICc8L2RlbD4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpbmsgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICBpZiAodGhpcy5vcHRpb25zLnNhbml0aXplKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBwcm90ID0gZGVjb2RlVVJJQ29tcG9uZW50KHVuZXNjYXBlKGhyZWYpKVxuICAgICAgICAucmVwbGFjZSgvW15cXHc6XS9nLCAnJylcbiAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGlmIChwcm90LmluZGV4T2YoJ2phdmFzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCd2YnNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ2RhdGE6JykgPT09IDApIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgfVxuICBpZiAodGhpcy5vcHRpb25zLmJhc2VVcmwgJiYgIW9yaWdpbkluZGVwZW5kZW50VXJsLnRlc3QoaHJlZikpIHtcbiAgICBocmVmID0gcmVzb2x2ZVVybCh0aGlzLm9wdGlvbnMuYmFzZVVybCwgaHJlZik7XG4gIH1cbiAgdmFyIG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9ICc+JyArIHRleHQgKyAnPC9hPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaW1hZ2UgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICBpZiAodGhpcy5vcHRpb25zLmJhc2VVcmwgJiYgIW9yaWdpbkluZGVwZW5kZW50VXJsLnRlc3QoaHJlZikpIHtcbiAgICBocmVmID0gcmVzb2x2ZVVybCh0aGlzLm9wdGlvbnMuYmFzZVVybCwgaHJlZik7XG4gIH1cbiAgdmFyIG91dCA9ICc8aW1nIHNyYz1cIicgKyBocmVmICsgJ1wiIGFsdD1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSB0aGlzLm9wdGlvbnMueGh0bWwgPyAnLz4nIDogJz4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiB0ZXh0O1xufTtcblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cblxuZnVuY3Rpb24gUGFyc2VyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbiA9IG51bGw7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLm9wdGlvbnMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG59XG5cbi8qKlxuICogU3RhdGljIFBhcnNlIE1ldGhvZFxuICovXG5cblBhcnNlci5wYXJzZSA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucywgcmVuZGVyZXIpIHtcbiAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucywgcmVuZGVyZXIpO1xuICByZXR1cm4gcGFyc2VyLnBhcnNlKHNyYyk7XG59O1xuXG4vKipcbiAqIFBhcnNlIExvb3BcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oc3JjKSB7XG4gIHRoaXMuaW5saW5lID0gbmV3IElubGluZUxleGVyKHNyYy5saW5rcywgdGhpcy5vcHRpb25zLCB0aGlzLnJlbmRlcmVyKTtcbiAgdGhpcy50b2tlbnMgPSBzcmMucmV2ZXJzZSgpO1xuXG4gIHZhciBvdXQgPSAnJztcbiAgd2hpbGUgKHRoaXMubmV4dCgpKSB7XG4gICAgb3V0ICs9IHRoaXMudG9rKCk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2VuID0gdGhpcy50b2tlbnMucG9wKCk7XG59O1xuXG4vKipcbiAqIFByZXZpZXcgTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy50b2tlbnMubGVuZ3RoIC0gMV0gfHwgMDtcbn07XG5cbi8qKlxuICogUGFyc2UgVGV4dCBUb2tlbnNcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlVGV4dCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYm9keSA9IHRoaXMudG9rZW4udGV4dDtcblxuICB3aGlsZSAodGhpcy5wZWVrKCkudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgYm9keSArPSAnXFxuJyArIHRoaXMubmV4dCgpLnRleHQ7XG4gIH1cblxuICByZXR1cm4gdGhpcy5pbmxpbmUub3V0cHV0KGJvZHkpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBDdXJyZW50IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS50b2sgPSBmdW5jdGlvbigpIHtcbiAgc3dpdGNoICh0aGlzLnRva2VuLnR5cGUpIHtcbiAgICBjYXNlICdzcGFjZSc6IHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY2FzZSAnaHInOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ocigpO1xuICAgIH1cbiAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaGVhZGluZyhcbiAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCksXG4gICAgICAgIHRoaXMudG9rZW4uZGVwdGgsXG4gICAgICAgIHRoaXMudG9rZW4udGV4dCk7XG4gICAgfVxuICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5jb2RlKHRoaXMudG9rZW4udGV4dCxcbiAgICAgICAgdGhpcy50b2tlbi5sYW5nLFxuICAgICAgICB0aGlzLnRva2VuLmVzY2FwZWQpO1xuICAgIH1cbiAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgIHZhciBoZWFkZXIgPSAnJ1xuICAgICAgICAsIGJvZHkgPSAnJ1xuICAgICAgICAsIGlcbiAgICAgICAgLCByb3dcbiAgICAgICAgLCBjZWxsXG4gICAgICAgICwgZmxhZ3NcbiAgICAgICAgLCBqO1xuXG4gICAgICAvLyBoZWFkZXJcbiAgICAgIGNlbGwgPSAnJztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmhlYWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBmbGFncyA9IHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9O1xuICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLmhlYWRlcltpXSksXG4gICAgICAgICAgeyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGhlYWRlciArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICByb3cgPSB0aGlzLnRva2VuLmNlbGxzW2ldO1xuXG4gICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQocm93W2pdKSxcbiAgICAgICAgICAgIHsgaGVhZGVyOiBmYWxzZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25bal0gfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci50YWJsZShoZWFkZXIsIGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdibG9ja3F1b3RlX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdibG9ja3F1b3RlX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ibG9ja3F1b3RlKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJ1xuICAgICAgICAsIG9yZGVyZWQgPSB0aGlzLnRva2VuLm9yZGVyZWQ7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdChib2R5LCBvcmRlcmVkKTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rZW4udHlwZSA9PT0gJ3RleHQnXG4gICAgICAgICAgPyB0aGlzLnBhcnNlVGV4dCgpXG4gICAgICAgICAgOiB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0aXRlbShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbG9vc2VfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0aXRlbShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgIHZhciBodG1sID0gIXRoaXMudG9rZW4ucHJlICYmICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgPyB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KVxuICAgICAgICA6IHRoaXMudG9rZW4udGV4dDtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmh0bWwoaHRtbCk7XG4gICAgfVxuICAgIGNhc2UgJ3BhcmFncmFwaCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSk7XG4gICAgfVxuICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5wYXJzZVRleHQoKSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEhlbHBlcnNcbiAqL1xuXG5mdW5jdGlvbiBlc2NhcGUoaHRtbCwgZW5jb2RlKSB7XG4gIHJldHVybiBodG1sXG4gICAgLnJlcGxhY2UoIWVuY29kZSA/IC8mKD8hIz9cXHcrOykvZyA6IC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgLnJlcGxhY2UoLycvZywgJyYjMzk7Jyk7XG59XG5cbmZ1bmN0aW9uIHVuZXNjYXBlKGh0bWwpIHtcblx0Ly8gZXhwbGljaXRseSBtYXRjaCBkZWNpbWFsLCBoZXgsIGFuZCBuYW1lZCBIVE1MIGVudGl0aWVzXG4gIHJldHVybiBodG1sLnJlcGxhY2UoLyYoIyg/OlxcZCspfCg/OiN4WzAtOUEtRmEtZl0rKXwoPzpcXHcrKSk7Py9pZywgZnVuY3Rpb24oXywgbikge1xuICAgIG4gPSBuLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG4gPT09ICdjb2xvbicpIHJldHVybiAnOic7XG4gICAgaWYgKG4uY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgIHJldHVybiBuLmNoYXJBdCgxKSA9PT0gJ3gnXG4gICAgICAgID8gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChuLnN1YnN0cmluZygyKSwgMTYpKVxuICAgICAgICA6IFN0cmluZy5mcm9tQ2hhckNvZGUoK24uc3Vic3RyaW5nKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZShyZWdleCwgb3B0KSB7XG4gIHJlZ2V4ID0gcmVnZXguc291cmNlO1xuICBvcHQgPSBvcHQgfHwgJyc7XG4gIHJldHVybiBmdW5jdGlvbiBzZWxmKG5hbWUsIHZhbCkge1xuICAgIGlmICghbmFtZSkgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXgsIG9wdCk7XG4gICAgdmFsID0gdmFsLnNvdXJjZSB8fCB2YWw7XG4gICAgdmFsID0gdmFsLnJlcGxhY2UoLyhefFteXFxbXSlcXF4vZywgJyQxJyk7XG4gICAgcmVnZXggPSByZWdleC5yZXBsYWNlKG5hbWUsIHZhbCk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgaHJlZikge1xuICBpZiAoIWJhc2VVcmxzWycgJyArIGJhc2VdKSB7XG4gICAgLy8gd2UgY2FuIGlnbm9yZSBldmVyeXRoaW5nIGluIGJhc2UgYWZ0ZXIgdGhlIGxhc3Qgc2xhc2ggb2YgaXRzIHBhdGggY29tcG9uZW50LFxuICAgIC8vIGJ1dCB3ZSBtaWdodCBuZWVkIHRvIGFkZCBfdGhhdF9cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNzZWN0aW9uLTNcbiAgICBpZiAoL15bXjpdKzpcXC8qW14vXSokLy50ZXN0KGJhc2UpKSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IGJhc2UgKyAnLyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gYmFzZS5yZXBsYWNlKC9bXi9dKiQvLCAnJyk7XG4gICAgfVxuICB9XG4gIGJhc2UgPSBiYXNlVXJsc1snICcgKyBiYXNlXTtcblxuICBpZiAoaHJlZi5zbGljZSgwLCAyKSA9PT0gJy8vJykge1xuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoLzpbXFxzXFxTXSovLCAnOicpICsgaHJlZjtcbiAgfSBlbHNlIGlmIChocmVmLmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZSgvKDpcXC8qW14vXSopW1xcc1xcU10qLywgJyQxJykgKyBocmVmO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlICsgaHJlZjtcbiAgfVxufVxudmFyIGJhc2VVcmxzID0ge307XG52YXIgb3JpZ2luSW5kZXBlbmRlbnRVcmwgPSAvXiR8XlthLXpdW2EtejAtOSsuLV0qOnxeWz8jXS9pO1xuXG5mdW5jdGlvbiBub29wKCkge31cbm5vb3AuZXhlYyA9IG5vb3A7XG5cbmZ1bmN0aW9uIG1lcmdlKG9iaikge1xuICB2YXIgaSA9IDFcbiAgICAsIHRhcmdldFxuICAgICwga2V5O1xuXG4gIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzW2ldO1xuICAgIGZvciAoa2V5IGluIHRhcmdldCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB0YXJnZXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5cbi8qKlxuICogTWFya2VkXG4gKi9cblxuZnVuY3Rpb24gbWFya2VkKHNyYywgb3B0LCBjYWxsYmFjaykge1xuICBpZiAoY2FsbGJhY2sgfHwgdHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0O1xuICAgICAgb3B0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQgfHwge30pO1xuXG4gICAgdmFyIGhpZ2hsaWdodCA9IG9wdC5oaWdobGlnaHRcbiAgICAgICwgdG9rZW5zXG4gICAgICAsIHBlbmRpbmdcbiAgICAgICwgaSA9IDA7XG5cbiAgICB0cnkge1xuICAgICAgdG9rZW5zID0gTGV4ZXIubGV4KHNyYywgb3B0KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICB9XG5cbiAgICBwZW5kaW5nID0gdG9rZW5zLmxlbmd0aDtcblxuICAgIHZhciBkb25lID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3V0O1xuXG4gICAgICB0cnkge1xuICAgICAgICBvdXQgPSBQYXJzZXIucGFyc2UodG9rZW5zLCBvcHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlcnIgPSBlO1xuICAgICAgfVxuXG4gICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgICByZXR1cm4gZXJyXG4gICAgICAgID8gY2FsbGJhY2soZXJyKVxuICAgICAgICA6IGNhbGxiYWNrKG51bGwsIG91dCk7XG4gICAgfTtcblxuICAgIGlmICghaGlnaGxpZ2h0IHx8IGhpZ2hsaWdodC5sZW5ndGggPCAzKSB7XG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH1cblxuICAgIGRlbGV0ZSBvcHQuaGlnaGxpZ2h0O1xuXG4gICAgaWYgKCFwZW5kaW5nKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgZm9yICg7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIChmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ2NvZGUnKSB7XG4gICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodCh0b2tlbi50ZXh0LCB0b2tlbi5sYW5nLCBmdW5jdGlvbihlcnIsIGNvZGUpIHtcbiAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgIGlmIChjb2RlID09IG51bGwgfHwgY29kZSA9PT0gdG9rZW4udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuLnRleHQgPSBjb2RlO1xuICAgICAgICAgIHRva2VuLmVzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSkodG9rZW5zW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAob3B0KSBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICAgIHJldHVybiBQYXJzZXIucGFyc2UoTGV4ZXIubGV4KHNyYywgb3B0KSwgb3B0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGUubWVzc2FnZSArPSAnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZC4nO1xuICAgIGlmICgob3B0IHx8IG1hcmtlZC5kZWZhdWx0cykuc2lsZW50KSB7XG4gICAgICByZXR1cm4gJzxwPkFuIGVycm9yIG9jY3VycmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cblxubWFya2VkLm9wdGlvbnMgPVxubWFya2VkLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHQpIHtcbiAgbWVyZ2UobWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICByZXR1cm4gbWFya2VkO1xufTtcblxubWFya2VkLmRlZmF1bHRzID0ge1xuICBnZm06IHRydWUsXG4gIHRhYmxlczogdHJ1ZSxcbiAgYnJlYWtzOiBmYWxzZSxcbiAgcGVkYW50aWM6IGZhbHNlLFxuICBzYW5pdGl6ZTogZmFsc2UsXG4gIHNhbml0aXplcjogbnVsbCxcbiAgbWFuZ2xlOiB0cnVlLFxuICBzbWFydExpc3RzOiBmYWxzZSxcbiAgc2lsZW50OiBmYWxzZSxcbiAgaGlnaGxpZ2h0OiBudWxsLFxuICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICBzbWFydHlwYW50czogZmFsc2UsXG4gIGhlYWRlclByZWZpeDogJycsXG4gIHJlbmRlcmVyOiBuZXcgUmVuZGVyZXIsXG4gIHhodG1sOiBmYWxzZSxcbiAgYmFzZVVybDogbnVsbFxufTtcblxuLyoqXG4gKiBFeHBvc2VcbiAqL1xuXG5tYXJrZWQuUGFyc2VyID0gUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IFBhcnNlci5wYXJzZTtcblxubWFya2VkLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5cbm1hcmtlZC5MZXhlciA9IExleGVyO1xubWFya2VkLmxleGVyID0gTGV4ZXIubGV4O1xuXG5tYXJrZWQuSW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlcjtcbm1hcmtlZC5pbmxpbmVMZXhlciA9IElubGluZUxleGVyLm91dHB1dDtcblxubWFya2VkLnBhcnNlID0gbWFya2VkO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gbWFya2VkO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbWFya2VkOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMubWFya2VkID0gbWFya2VkO1xufVxuXG59KS5jYWxsKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcyB8fCAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpO1xufSgpKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDIzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImRlZiBzaHVmZmxlIGFycmF5XG5cdHZhciBjb3VudGVyID0gYXJyYXk6bGVuZ3RoLCB0ZW1wLCBpbmRleFxuXG5cdCMgV2hpbGUgdGhlcmUgYXJlIGVsZW1lbnRzIGluIHRoZSBhcnJheVxuXHR3aGlsZSBjb3VudGVyID4gMFxuXHRcdCMgUGljayBhIHJhbmRvbSBpbmRleFxuXHRcdGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSAqIGNvdW50ZXIpXG5cdFx0Y291bnRlci0tICMgRGVjcmVhc2UgY291bnRlciBieSAxXG5cdFx0IyBBbmQgc3dhcCB0aGUgbGFzdCBlbGVtZW50IHdpdGggaXRcblx0XHR0ZW1wID0gYXJyYXlbY291bnRlcl1cblx0XHRhcnJheVtjb3VudGVyXSA9IGFycmF5W2luZGV4XVxuXHRcdGFycmF5W2luZGV4XSA9IHRlbXBcblx0XG5cdHJldHVybiBhcnJheVxuXG5leHBvcnQgdGFnIFBhdHRlcm5cblxuXHRkZWYgc2V0dXBcblx0XHRyZXR1cm4gc2VsZiBpZiAkbm9kZSRcblx0XHR2YXIgcGFydHMgPSB7dGFnczogW10sIGtleXdvcmRzOiBbXSwgbWV0aG9kczogW119XG5cdFx0dmFyIGl0ZW1zID0gW11cblx0XHR2YXIgbGluZXMgPSBbXVxuXG5cdFx0Zm9yIG93biBrLHYgb2YgSW1iYS5UYWc6cHJvdG90eXBlXG5cdFx0XHRpdGVtcy5wdXNoKFwiPGVtPntrfTwvZW0+XCIpXG5cdFx0XHRwYXJ0czptZXRob2RzLnB1c2goXCI8ZW0+e2t9PC9lbT5cIilcblxuXHRcdGZvciBrIGluIEltYmEuSFRNTF9UQUdTIG9yIEhUTUxfVEFHU1xuXHRcdFx0aXRlbXMucHVzaChcIjx1PiZsdDt7a30mZ3Q7PC91PlwiKVxuXHRcdFx0cGFydHM6dGFncy5wdXNoKFwiPHU+Jmx0O3trfSZndDs8L3U+XCIpXG5cblx0XHR2YXIgd29yZHMgPSBcImRlZiBpZiBlbHNlIGVsaWYgd2hpbGUgdW50aWwgZm9yIGluIG9mIHZhciBsZXQgY2xhc3MgZXh0ZW5kIGV4cG9ydCBpbXBvcnQgdGFnIGdsb2JhbFwiXG5cblx0XHRmb3IgayBpbiB3b3Jkcy5zcGxpdChcIiBcIilcblx0XHRcdGl0ZW1zLnB1c2goXCI8aT57a308L2k+XCIpXG5cdFx0XHRwYXJ0czprZXl3b3Jkcy5wdXNoKFwiPGk+e2t9PC9pPlwiKVxuXG5cdFx0dmFyIHNodWZmbGVkID0gc2h1ZmZsZShpdGVtcylcblx0XHR2YXIgYWxsID0gW10uY29uY2F0KHNodWZmbGVkKVxuXHRcdHZhciBjb3VudCA9IGl0ZW1zOmxlbmd0aCAtIDFcblxuXHRcdGZvciBsbiBpbiBbMCAuLiAxNF1cblx0XHRcdGxldCBjaGFycyA9IDBcblx0XHRcdGxpbmVzW2xuXSA9IFtdXG5cdFx0XHR3aGlsZSBjaGFycyA8IDMwMFxuXHRcdFx0XHRsZXQgaXRlbSA9IChzaHVmZmxlZC5wb3Agb3IgYWxsW01hdGguZmxvb3IoY291bnQgKiBNYXRoLnJhbmRvbSldKVxuXHRcdFx0XHRpZiBpdGVtXG5cdFx0XHRcdFx0Y2hhcnMgKz0gaXRlbTpsZW5ndGhcblx0XHRcdFx0XHRsaW5lc1tsbl0ucHVzaChpdGVtKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0Y2hhcnMgPSA0MDBcblxuXHRcdGRvbTppbm5lckhUTUwgPSAnPGRpdj4nICsgbGluZXMubWFwKHxsbixpfFxuXHRcdFx0bGV0IG8gPSBNYXRoLm1heCgwLCgoaSAtIDIpICogMC4zIC8gMTQpKS50b0ZpeGVkKDIpXG5cdFx0XHRcIjxkaXYgY2xhc3M9J2xpbmUnIHN0eWxlPSdvcGFjaXR5OiB7b307Jz5cIiArIGxuLmpvaW4oXCIgXCIpICsgJzwvZGl2Pidcblx0XHQpLmpvaW4oJycpICsgJzwvZGl2Pidcblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcbmltcG9ydCBTbmlwcGV0IGZyb20gJy4vU25pcHBldCdcblxudGFnIEd1aWRlVE9DXG5cdHByb3AgdG9jXG5cdGF0dHIgbGV2ZWxcblxuXHRkZWYgdG9nZ2xlXG5cdFx0dG9nZ2xlRmxhZygnY29sbGFwc2VkJylcblx0XHRcblx0ZGVmIHRvY1xuXHRcdEB0b2Mgb3IgZGF0YS50b2Ncblx0XHRcblx0ZGVmIHJvdXRlXG5cdFx0XCJ7ZGF0YS5wYXRofSN7dG9jOnNsdWd9XCJcdFx0XG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgZGF0YS5yZWFkeVxuXG5cdFx0bGV0IHRvYyA9IHRvY1xuXHRcdHJlcm91dGVcblx0XG5cdFx0PHNlbGYudG9jLmVudHJ5IGxldmVsPSh0b2M6bGV2ZWwpPlxuXHRcdFx0aWYgdG9jOmNoaWxkcmVuOmxlbmd0aCBhbmQgdG9jOmxldmVsIDwgM1xuXHRcdFx0XHQ8LmhlYWRlcj5cblx0XHRcdFx0XHQ8YSBocmVmPXJvdXRlPiB0b2M6dGl0bGVcblx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdGZvciBjaGlsZCBpbiB0b2M6Y2hpbGRyZW4gd2hlbiBjaGlsZDpsZXZlbCA8IDNcblx0XHRcdFx0XHRcdDxHdWlkZVRPQ1tkYXRhXSB0b2M9Y2hpbGQ+XG5cdFx0XHRlbHNlXG5cdFx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXG50YWcgR3VpZGVcblx0XG5cdGRlZiBzZXR1cFxuXHRcdHJlbmRlclxuXHRcdEBib2R5LmRvbTppbm5lckhUTUwgPSBkYXRhOmJvZHlcblx0XHRpZiAkd2ViJFxuXHRcdFx0YXdha2VuU25pcHBldHNcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZi5tZD5cblx0XHRcdDxkaXZAYm9keT5cblx0XHRcdDxmb290ZXI+XG5cdFx0XHRcdGlmIGxldCByZWYgPSBhcHAuZ3VpZGVbZGF0YTpwcmV2XVxuXHRcdFx0XHRcdDxhLnByZXYgaHJlZj1cIi9ndWlkZS97cmVmOmlkfVwiPiBcIuKGkCBcIiArIHJlZjp0aXRsZVxuXHRcdFx0XHRpZiBsZXQgcmVmID0gYXBwLmd1aWRlW2RhdGE6bmV4dF1cblx0XHRcdFx0XHQ8YS5uZXh0IGhyZWY9XCIvZ3VpZGUve3JlZjppZH1cIj4gcmVmOnRpdGxlICsgXCIg4oaSXCJcblxuXHRkZWYgYXdha2VuU25pcHBldHNcblx0XHRmb3IgaXRlbSBpbiBkb20ucXVlcnlTZWxlY3RvckFsbCgnLnNuaXBwZXQnKVxuXHRcdFx0bGV0IGNvZGUgPSBpdGVtOnRleHRDb250ZW50XG5cdFx0XHRpZiBjb2RlLmluZGV4T2YoJ0ltYmEubW91bnQnKSA+PSAwXG5cdFx0XHRcdFNuaXBwZXQucmVwbGFjZShpdGVtKVxuXHRcdHNlbGZcblxudGFnIFRPQyA8IGxpXG5cdHByb3AgdG9jXG5cdHByb3AgZXhwYW5kZWQgZGVmYXVsdDogdHJ1ZVxuXHRhdHRyIGxldmVsXG5cdFxuXHRkZWYgcm91dGVcblx0XHRcIi9ndWlkZS97ZGF0YTpyb3V0ZX0je3RvYzpzbHVnfVwiXG5cdFx0XG5cdGRlZiB0b2Ncblx0XHRAdG9jIG9yIGRhdGE6dG9jWzBdXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZi50b2MuZW50cnkgbGV2ZWw9KHRvYzpsZXZlbCk+XG5cdFx0XHQ8YSBocmVmPXJvdXRlPiB0b2M6dGl0bGVcblx0XHRcdGlmIHRvYzpjaGlsZHJlbjpsZW5ndGggYW5kIHRvYzpsZXZlbCA8IDIgYW5kIGV4cGFuZGVkXG5cdFx0XHRcdDx1bD4gZm9yIGNoaWxkIGluIHRvYzpjaGlsZHJlbiB3aGVuIGNoaWxkOmxldmVsIDwgM1xuXHRcdFx0XHRcdDxUT0NbZGF0YV0gdG9jPWNoaWxkPlxuXG5leHBvcnQgdGFnIEd1aWRlc1BhZ2UgPCBQYWdlXG5cdFxuXHRkZWYgbW91bnRcblx0XHRAb25zY3JvbGwgfHw9IGRvIHNjcm9sbGVkXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsQG9uc2Nyb2xsLHBhc3NpdmU6IHRydWUpXG5cblx0ZGVmIHVubW91bnRcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJyxAb25zY3JvbGwscGFzc2l2ZTogdHJ1ZSlcblx0XHRcblx0ZGVmIGd1aWRlXG5cdFx0ZGF0YVtyb3V0ZXIucGF0aC5yZXBsYWNlKCcvZ3VpZGUvJywnJyldIG9yIGRhdGFbJ2Vzc2VudGlhbHMvaW50cm9kdWN0aW9uJ11cblx0XHRcblx0ZGVmIHNjcm9sbGVkXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRcdHZhciBpdGVtcyA9IGRvbS5xdWVyeVNlbGVjdG9yQWxsKCdbaWRdJylcblx0XHR2YXIgbWF0Y2hcblxuXHRcdHZhciBzY3JvbGxUb3AgPSB3aW5kb3c6cGFnZVlPZmZzZXRcblx0XHR2YXIgd2ggPSB3aW5kb3c6aW5uZXJIZWlnaHRcblx0XHR2YXIgZGggPSBkb2N1bWVudDpib2R5OnNjcm9sbEhlaWdodFxuXG5cdFx0aWYgQHNjcm9sbEZyZWV6ZSA+PSAwXG5cdFx0XHR2YXIgZGlmZiA9IE1hdGguYWJzKHNjcm9sbFRvcCAtIEBzY3JvbGxGcmVlemUpXG5cdFx0XHRyZXR1cm4gc2VsZiBpZiBkaWZmIDwgNTBcblx0XHRcdEBzY3JvbGxGcmVlemUgPSAtMVxuXG5cdFx0dmFyIHNjcm9sbEJvdHRvbSA9IGRoIC0gKHNjcm9sbFRvcCArIHdoKVxuXG5cdFx0aWYgc2Nyb2xsQm90dG9tID09IDBcblx0XHRcdG1hdGNoID0gaXRlbXNbaXRlbXMubGVuIC0gMV1cblx0XHRlbHNlXG5cdFx0XHRmb3IgaXRlbSBpbiBpdGVtc1xuXHRcdFx0XHR2YXIgdCA9IChpdGVtOm9mZnNldFRvcCArIDMwICsgNjApICMgaGFja1xuXHRcdFx0XHR2YXIgZGlzdCA9IHNjcm9sbFRvcCAtIHRcblxuXHRcdFx0XHRpZiBkaXN0IDwgMFxuXHRcdFx0XHRcdGJyZWFrIG1hdGNoID0gaXRlbVxuXHRcdFxuXHRcdGlmIG1hdGNoXG5cdFx0XHRpZiBAaGFzaCAhPSBtYXRjaDppZFxuXHRcdFx0XHRAaGFzaCA9IG1hdGNoOmlkXG5cdFx0XHRcdHJvdXRlci5nbygnIycgKyBAaGFzaCx7fSx5ZXMpXG5cdFx0XHRcdHJlbmRlclxuXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgb25yb3V0ZSBlXG5cdFx0ZS5zdG9wXG5cdFx0bG9nICdndWlkZXMgcm91dGVkJ1xuXHRcdHZhciBzY3JvbGwgPSBkb1xuXHRcdFx0aWYgbGV0IGVsID0gZG9tLnF1ZXJ5U2VsZWN0b3IoJyMnICsgcm91dGVyLmhhc2gpXG5cdFx0XHRcdGVsLnNjcm9sbEludG9WaWV3KHRydWUpXG5cdFx0XHRcdEBzY3JvbGxGcmVlemUgPSB3aW5kb3c6cGFnZVlPZmZzZXRcblx0XHRcdFx0cmV0dXJuIGVsXG5cdFx0XHRyZXR1cm4gbm9cblxuXHRcdGlmIHJvdXRlci5oYXNoXG5cdFx0XHQjIHJlbmRlclxuXHRcdFx0c2Nyb2xsKCkgb3Igc2V0VGltZW91dChzY3JvbGwsMjApXG5cblx0XHRzZWxmXG5cdCMgcHJvcCBndWlkZVxuXG5cdGRlZiByZW5kZXJcblx0XHRsZXQgY3VyciA9IGd1aWRlXG5cblx0XHQ8c2VsZi5fcGFnZT5cblx0XHRcdDxuYXZAbmF2PlxuXHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0Zm9yIGl0ZW0gaW4gZGF0YTp0b2Ncblx0XHRcdFx0XHRcdDxoMT4gaXRlbTp0aXRsZSBvciBpdGVtOmlkXG5cdFx0XHRcdFx0XHQ8dWw+XG5cdFx0XHRcdFx0XHRcdGZvciBzZWN0aW9uIGluIGl0ZW06c2VjdGlvbnNcblx0XHRcdFx0XHRcdFx0XHQ8VE9DW2RhdGFbc2VjdGlvbl1dIGV4cGFuZGVkPShkYXRhW3NlY3Rpb25dID09IGN1cnIpPlxuXHRcdFx0XHRcdCMgZm9yIGd1aWRlIGluIGRhdGFcblx0XHRcdFx0XHQjXHQ8VE9DW2d1aWRlXSB0b2M9Z3VpZGU6dG9jWzBdIGV4cGFuZGVkPShndWlkZSA9PSBjdXJyKT5cblx0XHRcdDwuYm9keS5saWdodD5cblx0XHRcdFx0aWYgZ3VpZGVcblx0XHRcdFx0XHQ8R3VpZGVAe2d1aWRlOmlkfVtndWlkZV0+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0d1aWRlc1BhZ2UuaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcblxuZGVmIHBhdGhUb0FuY2hvciBwYXRoXG5cdCdhcGktJyArIHBhdGgucmVwbGFjZSgvXFwuL2csJ18nKS5yZXBsYWNlKC9cXCMvZywnX18nKS5yZXBsYWNlKC9cXD0vZywnX3NldCcpXG5cbnRhZyBEZXNjXG5cblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRpZiBodG1sICE9IEBodG1sXG5cdFx0XHRkb206aW5uZXJIVE1MID0gQGh0bWwgPSBodG1sXG5cdFx0c2VsZlxuXG50YWcgUmVmXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXG50YWcgSXRlbVxuXG50YWcgUGF0aCA8IHNwYW5cblx0cHJvcCBzaG9ydFxuXG5cdGRlZiBzZXR1cFxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0dmFyIHN0ciA9IGRhdGFcblx0XHRpZiBzdHIgaXNhIFN0cmluZ1xuXHRcdFx0aWYgc2hvcnRcblx0XHRcdFx0c3RyID0gc3RyLnJlcGxhY2UoLyhbQS1aXVxcdypcXC4pKig/PVtBLVpdKS9nLCcnKVxuXG5cdFx0XHRodG1sID0gc3RyLnJlcGxhY2UoL1xcYihbXFx3XSt8XFwufFxcIylcXGIvZykgZG8gfG0saXxcblx0XHRcdFx0aWYgaSA9PSAnLicgb3IgaSA9PSAnIydcblx0XHRcdFx0XHRcIjxpPntpfTwvaT5cIlxuXHRcdFx0XHRlbGlmIGlbMF0gPT0gaVswXS50b1VwcGVyQ2FzZVxuXHRcdFx0XHRcdFwiPGIgY2xhc3M9J2NvbnN0Jz57aX08L2I+XCJcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFwiPGIgY2xhc3M9J2lkJz57aX08L2I+XCJcblx0XHRzZWxmXG5cblxudGFnIFJldHVyblxuXHRhdHRyIG5hbWVcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cdFx0XHQ8UGF0aFtkYXRhOnZhbHVlXS52YWx1ZT5cblx0XHRcdDxzcGFuLmRlc2M+IGRhdGE6ZGVzY1xuXG50YWcgQ2xhc3MgPCBJdGVtXG5cblx0cHJvcCBkYXRhIHdhdGNoOiA6cGFyc2VcblxuXHRkZWYgcGFyc2Vcblx0XHRAc3RhdGljcyA9IChtIGZvciBtIGluIGRhdGFbJy4nXSB3aGVuIG06ZGVzYylcblx0XHRAbWV0aG9kcyA9IChtIGZvciBtIGluIGRhdGFbJyMnXSB3aGVuIG06ZGVzYylcblx0XHRAcHJvcGVydGllcyA9IFtdXG5cdFx0c2VsZlxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblx0XHRcdDxzcGFuLnRvYy1hbmNob3IgaWQ9cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpPlxuXHRcdFx0PC5oZWFkZXI+IDwudGl0bGU+IDxQYXRoW2RhdGE6bmFtZXBhdGhdPlxuXHRcdFx0PERlc2MgaHRtbD1kYXRhOmh0bWw+XG5cdFx0XHRpZiBkYXRhOmN0b3Jcblx0XHRcdFx0PC5jb250ZW50LmN0b3I+XG5cdFx0XHRcdFx0PE1ldGhvZFtkYXRhOmN0b3JdIHBhdGg9KGRhdGE6bmFtZXBhdGggKyAnLm5ldycpPlxuXG5cdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdGlmIEBzdGF0aWNzOmxlbmd0aCA+IDBcblx0XHRcdFx0XHQ8LnNlY3Rpb24+XG5cdFx0XHRcdFx0XHQ8aDIuaGVhZGVyPiAnU3RhdGljIE1ldGhvZHMnXG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQubGlzdD4gZm9yIGl0ZW0gaW4gQHN0YXRpY3Ncblx0XHRcdFx0XHRcdFx0PE1ldGhvZFtpdGVtXS5kb2MgaW5hbWU9ZGF0YTpuYW1lcGF0aD5cblxuXHRcdFx0XHRpZiBAbWV0aG9kczpsZW5ndGggPiAwXG5cdFx0XHRcdFx0PC5zZWN0aW9uPlxuXHRcdFx0XHRcdFx0PGgyLmhlYWRlcj4gJ0luc3RhbmNlIE1ldGhvZHMnXG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQubGlzdD4gZm9yIGl0ZW0gaW4gQG1ldGhvZHNcblx0XHRcdFx0XHRcdFx0PE1ldGhvZFtpdGVtXS5kb2MgaW5hbWU9ZGF0YTppbmFtZT5cblxudGFnIFZhbHVlXG5cblx0ZGVmIHJlbmRlclxuXHRcdGlmIGRhdGE6dHlwZVxuXHRcdFx0PHNlbGYgLntkYXRhOnR5cGV9PlxuXHRcdFx0XHRkYXRhOnZhbHVlXG5cdFx0ZWxpZiBkYXRhIGlzYSBTdHJpbmdcblx0XHRcdDxzZWxmLnN0ciB0ZXh0PWRhdGE+XG5cdFx0ZWxpZiBkYXRhIGlzYSBOdW1iZXJcblx0XHRcdDxzZWxmLm51bSB0ZXh0PWRhdGE+XG5cdFx0c2VsZlxuXHRcdFxuXG50YWcgUGFyYW1cblxuXHRkZWYgdHlwZVxuXHRcdGRhdGE6dHlwZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiAue3R5cGV9PlxuXHRcdFx0aWYgdHlwZSA9PSAnTmFtZWRQYXJhbXMnXG5cdFx0XHRcdGZvciBwYXJhbSBpbiBkYXRhOm5vZGVzXG5cdFx0XHRcdFx0PFBhcmFtW3BhcmFtXT5cblx0XHRcdGVsc2Vcblx0XHRcdFx0PC5uYW1lPiBkYXRhOm5hbWVcblx0XHRcdFx0aWYgZGF0YTpkZWZhdWx0c1xuXHRcdFx0XHRcdDxpPiB0eXBlID09ICdOYW1lZFBhcmFtJyA/ICc6ICcgOiAnID0gJ1xuXHRcdFx0XHRcdDxWYWx1ZVtkYXRhOmRlZmF1bHRzXT5cblxudGFnIE1ldGhvZCA8IEl0ZW1cblxuXHRwcm9wIGluYW1lXG5cdHByb3AgcGF0aFxuXG5cdGRlZiB0YWdzXG5cdFx0PGRpdkB0YWdzPlxuXHRcdFx0PFJldHVybltkYXRhOnJldHVybl0gbmFtZT0ncmV0dXJucyc+IGlmIGRhdGE6cmV0dXJuXG5cblx0XHRcdGlmIGRhdGE6ZGVwcmVjYXRlZFxuXHRcdFx0XHQ8LmRlcHJlY2F0ZWQucmVkPiAnTWV0aG9kIGlzIGRlcHJlY2F0ZWQnXG5cdFx0XHRpZiBkYXRhOnByaXZhdGVcblx0XHRcdFx0PC5wcml2YXRlLnJlZD4gJ01ldGhvZCBpcyBwcml2YXRlJ1xuXG5cblx0ZGVmIHBhdGhcblx0XHRAcGF0aCBvciAoaW5hbWUgKyAnLicgKyBkYXRhOm5hbWUpXG5cblx0ZGVmIHNsdWdcblx0XHRwYXRoVG9BbmNob3IoZGF0YTpuYW1lcGF0aClcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgLmRlcHJlY2F0ZWQ9KGRhdGE6ZGVwcmVjYXRlZCkgPlxuXHRcdFx0PHNwYW4udG9jLWFuY2hvciBpZD1zbHVnPlxuXHRcdFx0PC5oZWFkZXI+XG5cdFx0XHRcdDxQYXRoW3BhdGhdPlxuXHRcdFx0XHQ8LnBhcmFtcz4gZm9yIHBhcmFtIGluIGRhdGE6cGFyYW1zXG5cdFx0XHRcdFx0PFBhcmFtW3BhcmFtXT5cblx0XHRcdFx0PC5ncm93PlxuXHRcdFx0PERlc2MubWQgaHRtbD1kYXRhOmh0bWw+XG5cdFx0XHR0YWdzXG5cbnRhZyBMaW5rIDwgYVxuXHRwcm9wIHNob3J0XG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIGhyZWY9XCIvZG9jcyN7cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpfVwiPiA8UGF0aFtkYXRhOm5hbWVwYXRoXSBzaG9ydD1zaG9ydD5cblx0XHRzdXBlclxuXG5cdGRlZiBvbnRhcFxuXHRcdHN1cGVyXG5cdFx0dHJpZ2dlcigncmVmb2N1cycpXG5cbnRhZyBHcm91cFxuXG5cdGRlZiBvbnRhcFxuXHRcdHRvZ2dsZUZsYWcoJ2NvbGxhcHNlZCcpXG5cblxuZXhwb3J0IHRhZyBEb2NzUGFnZSA8IFBhZ2VcblxuXHRwcm9wIHZlcnNpb24gZGVmYXVsdDogJ2N1cnJlbnQnXG5cdHByb3Agcm9vdHNcblxuXHRkZWYgc3JjXG5cdFx0XCIvYXBpL3t2ZXJzaW9ufS5qc29uXCJcblxuXHRkZWYgZG9jc1xuXHRcdEBkb2NzXG5cblx0ZGVmIHNldHVwXG5cdFx0bG9hZFxuXHRcdHN1cGVyXG5cblx0ZGVmIGxvYWRcblx0XHR2YXIgZG9jcyA9IGF3YWl0IGFwcC5mZXRjaChzcmMpXG5cdFx0RE9DUyA9IEBkb2NzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkb2NzKSlcblx0XHRET0NNQVAgPSBAZG9jczplbnRpdGllc1xuXHRcdGdlbmVyYXRlXG5cdFx0aWYgJHdlYiRcblx0XHRcdGxvYWRlZFxuXG5cdGRlZiBsb2FkZWRcblx0XHRyZW5kZXJcblx0XHRpZiBkb2N1bWVudDpsb2NhdGlvbjpoYXNoXG5cdFx0XHRpZiB2YXIgZWwgPSBkb20ucXVlcnlTZWxlY3Rvcihkb2N1bWVudDpsb2NhdGlvbjpoYXNoKVxuXHRcdFx0XHRlbC5zY3JvbGxJbnRvVmlld1xuXHRcdHNlbGZcblx0XHRcblx0ZGVmIG9ucmVmb2N1cyBlXG5cdFx0cmVmb2N1c1xuXG5cdGRlZiByZWZvY3VzXG5cdFx0aWYgdmFyIGVsID0gZG9tLnF1ZXJ5U2VsZWN0b3IoZG9jdW1lbnQ6bG9jYXRpb246aGFzaClcblx0XHRcdGVsLnNjcm9sbEludG9WaWV3XG5cdFx0c2VsZlxuXG5cdGRlZiBsb29rdXAgcGF0aFxuXHRcdGRvY3M6ZW50aXRpZXNbcGF0aF1cblxuXHRkZWYgZ2VuZXJhdGVcblx0XHRAcm9vdHMgPSBbXVxuXHRcdHZhciBlbnRzID0gQGRvY3M6ZW50aXRpZXNcblxuXHRcdGZvciBvd24gcGF0aCxpdGVtIG9mIGRvY3M6ZW50aXRpZXNcblx0XHRcdGlmIGl0ZW06dHlwZSA9PSAnY2xhc3MnIG9yIHBhdGggPT0gJ0ltYmEnXG5cdFx0XHRcdGl0ZW1bJy4nXSA9IChpdGVtWycuJ10gfHwgW10pLnNvcnQubWFwKHxwYXRofCBlbnRzW3BhdGhdICkuZmlsdGVyKHx2fCB2OnR5cGUgPT0gJ21ldGhvZCcgYW5kIHY6ZGVzYyApXG5cdFx0XHRcdGl0ZW1bJyMnXSA9IChpdGVtWycjJ10gfHwgW10pLnNvcnQubWFwKHxwYXRofCBlbnRzW3BhdGhdICkuZmlsdGVyKHx2fCB2OnR5cGUgPT0gJ21ldGhvZCcgYW5kIHY6ZGVzYyApXG5cblx0XHRcdFx0QHJvb3RzLnB1c2goaXRlbSkgaWYgaXRlbTpkZXNjXG5cdFx0c2VsZlxuXG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgZG9jc1xuXHRcdFxuXHRcdDxzZWxmPlxuXHRcdFx0PG5hdkBuYXY+IDwuY29udGVudD5cblx0XHRcdFx0Zm9yIHJvb3QgaW4gcm9vdHNcblx0XHRcdFx0XHQ8R3JvdXAudG9jLmNsYXNzLnNlY3Rpb24uY29tcGFjdD5cblx0XHRcdFx0XHRcdDwuaGVhZGVyPiA8TGlua1tyb290XS5jbGFzcz5cblx0XHRcdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHRcdFx0PC5zdGF0aWM+XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIG1ldGggaW4gcm9vdFsnLiddwqB3aGVuIG1ldGg6ZGVzYyBhbmQgIW1ldGg6cHJpdmF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0PC5lbnRyeT4gPExpbmtbbWV0aF0gc2hvcnQ9eWVzPlxuXHRcdFx0XHRcdFx0XHQ8Lmluc3RhbmNlPlxuXHRcdFx0XHRcdFx0XHRcdGZvciBtZXRoIGluIHJvb3RbJyMnXcKgd2hlbiBtZXRoOmRlc2MgYW5kICFtZXRoOnByaXZhdGVcblx0XHRcdFx0XHRcdFx0XHRcdDwuZW50cnk+IDxMaW5rW21ldGhdIHNob3J0PXllcz5cblx0XHRcdDwuYm9keT5cblx0XHRcdFx0Zm9yIHJvb3QgaW4gcm9vdHNcblx0XHRcdFx0XHQ8Q2xhc3Nbcm9vdF0uZG9jLmw+XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvRG9jc1BhZ2UuaW1iYSIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9sZXNzL3NpdGUubGVzc1xuLy8gbW9kdWxlIGlkID0gMjdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==