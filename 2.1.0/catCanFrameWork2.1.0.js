function CatCan() {//构造函数

	this.catRequestAnimationFrameId = 0;//动画回调函数的ID

	this.catStoreTxy = [];//移轴栈
	this.catStoreRxy = [];//真实坐标栈
	this.catStackTop = 0;//栈顶

	this.catCtx = null;//绘制时真正操作的对象
	this.catTimes = 0;//缩放倍率

	this.catFlag = false;//标示原点以及打印提示信息

	this.canvas = null;//canvas标签

	this.listNo = null;//当前所播放动画的序号

	this.catTreePic = [];//pic图片树
	this.catTreeImg = [];//img图层树
	this.catTreeAni = [];//animation动画树
	this.catTreePlay = [];//playList播放列表树

	this.channel = [];//动画缓存队列
};

CatCan.prototype.init = function(divId/*string*/,animation/*json*/) {//初始化函数

	/*	
		待处理参数列表:
		1.tagName=="div",添加canvas的容器*
		2.json对象*
		3."flag",标示原点以及打印提示信息
		4."xy",点击显示坐标
		5.{w,h,t},w与h是画板的宽度高度,默认使用配置文件中的宽度与高度;t(可选)是(相较于配置文件的)缩放比例,若不设置会根据w与h自动缩放
		6.数字,init与play的简写形成,初始化结束后会播放动画
	*/

	var catCan = this;

	//处理参数1
	if(!(animation&&animation.width&&animation.height&&animation.img&&animation.animation&&animation.playList)) {
		console.error("Function'init',parameter 2 is not a valid profile.");
		return;
	}

	//处理参数3-5
	var canvasWH = {w:animation.width,h:animation.height};//参数6默认值
	var catXY=false;//参数4与参数6的默认值
	for(var i=2;i<arguments.length;i++) {
		if(typeof arguments[i] === "string") {
			switch(arguments[i]) {
			case "flag"://参数3
				this.catFlag = true;
				break;
			case "xy"://参数4
				catXY = true;
			}
		} else if(typeof arguments[i].w === "number" && typeof arguments[i].h === "number") {
			canvasWH = arguments[i];//参数5
			if(arguments[i].t) {//缩放比例
				this.catTimes = arguments[i].t;
			} else if(canvasWH.w/animation.width*animation.height<canvasWH.h) {//宽度限制比例
				this.catTimes = canvasWH.w/animation.width;
			} else {//高度限制比例
				this.catTimes = canvasWH.h/animation.height;
			}
		} else if(typeof arguments[i] === "number") {
			catCan.listNo = arguments[i];//参数6
		}
	}

	//处理参数1:创建canvas标签相关
	var div = document.getElementById(divId);
	if(div.tagName==="DIV") {
		div.innerHTML = '<canvas width="'+canvasWH.w+'" height="'+canvasWH.h+'"></canvas>';
		this.canvas = div.firstChild;
		//处理参数4:是否点击canvas标签时显示坐标点
		if(catXY) {
			this.canvas.addEventListener("mousedown",function(e) {
				var eRect = div.firstChild.getBoundingClientRect();
				var x = e.clientX - eRect.left;
				var y = e.clientY - eRect.top;
				console.log(x,y);
			});
		}
	} else {
		console.error("Function'init',parameter 1 is not a valid profile.");
		return;
	}

	//处理参数2:创建图片,创建图层,创建动画,创建队列
	for(var i in animation.pic) {//创建图片
		var pic = new Image();
		pic.src = animation.pic[i];
		this.catTreePic[i] = pic;
	}
	this.catTreeImg = animation.img;//创建图层
	this.catTreeAni = animation.animation;//创建动画
	for(var i in this.catTreeAni) {
		var ani = this.catTreeAni[i];
		ani.data = [];//储存数据的数组
		var fS = ani[4]||"",regexp = /[a-z]{2}([A-Z]{1}[a-z]{2})+\(-?[\w.]*(,-?[\w.]*)*\);?/g;//fS:funString
		var iFA = fS.match(regexp);//iFA:initFunArray//match以数组形式返回匹配的字符串
		fS = fS.replace(regexp,"");//去除匹配的字符串后剩下的逻辑代码
		for(var i in iFA) {
			var fN = iFA[i].match(/[a-z]{2}([A-Z]{1}[a-z]{2})+/)[0];//fN:funName//匹配函数名
			var ps = iFA[i].match(/-?[\w.]+/g).slice(1);//ps:parameters,去掉第零个,从第一个截取
			if(!this.tool[fN]) {
				console.error("Function "+fN+" is not found in the basic library or the additional library.");
				return;
			}
			var re = this.tool[fN](i,ps);//把工具函数返回的信息和代表数字的flag存起来
			fS = re.fun+fS;//先执行需要预处理的,再执行其余的
			ani.data[i] = re.data;
			ani.data[i].flag = re.flag;
		}
		ani.fun = new Function(fS);
	}
	this.catTreePlay = animation.playList;//创建动画队列
	for(var i=0;i<this.catTreePlay.length;i++) {//playList中有几个动画循环几遍
		var play = this.catTreePlay[i];
		play.ani = [];//储存数据的数组
		for(var j=1;j<play.length;j++) {//该动画中有几个图层循环几遍,最前方的元素是动画播放的时常(单位ms),所以从1开始
			var d = play.ani[j] = [],a = this.catTreeAni[this.catTreePlay[i][j]];
			for(var k=0;k<a.length;k++) {
				d[k] = a[k];
				d.data = a.data;//只读不修改,可以用引用指向同一区域
				d.fun = a.fun;//函数拷贝,不知道是深度拷贝还是浅拷贝,反正能用
			}
		}
	}

	//栈相关
	this.catStoreTxy[0] = {tx:0,ty:0};
	this.catStoreRxy[-1] = {rx:0,ry:0,an:0};

	//画板对象
	this.catCtx = this.canvas.getContext("2d");

	if(catXY) {//有"xy"标识会打印CatCan对象
		console.log(this);
	}
	if(this.listNo!=undefined) {//有动画序号会自动播放动画
		this.play();
	}
};

CatCan.prototype.play = function(playNo/*number*/) {//立即播放动画,参数为动画序号(被next和init调用,不提倡手动调用)
	var listNo = this.listNo = playNo!==undefined?playNo:this.listNo;

	if(!this.catTreePlay[listNo]) {
		console.error("Animation "+listNo+" undefined.");
		return;
	}

	var catCan = this;
	var ctx = this.catCtx;
	var frame = catCan.catTreePlay[listNo][0]/50*3;
	var ct = this.catTimes;
	
	if(this.catRequestAnimationFrameId!=0) {//如果有动画在运行,取消该动画
		cancelAnimationFrame(this.catRequestAnimationFrameId);
		if(catCan.catFlag) {
			console.log("The animation has been replaced by No "+listNo+".");
		}
	} else if(catCan.catFlag) {
		console.log("Animation "+listNo+" played.");
	}

	function loop() {//每运行一次绘制一帧
		var top = catCan.catStackTop;
		for(var i=0;i<top;i++) {
			ctx.restore();
			catCan.catStackTop--;
		}
		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
		ctx.save();
		for(var i=1;i<catCan.catTreePlay[listNo].length;i++) {//最前面的是动画时常(单位ms),所以从1开始
			draw(i);
		}
		ctx.restore();
		frame--;
		if(frame>0) {//如果这个动画还没有运行完
			catCan.catRequestAnimationFrameId = requestAnimationFrame(loop);
		} else {//动画运行完了
			catCan.next();
		}
	};
	/*
		catAni数据格式(共10条,角标0-9):
		[
			0,	rt/向上层数/restoreTime
			0,	ci/图片切片序号/catImg
			0,	dx/绘制的位置
			0,	dy
			"",	fun/执行函数体
			0,	an/旋转角度/angle
			0,	tx/移轴
			0,	ty
			1,	sx/缩放/scale
			1	sy
		]
	 */
	function draw(aniNo) {//每运行一次绘制一帧中的一个图层,参数表示这是几号图层
		var layer = catCan.catTreePlay[listNo].ani[aniNo];//layer 图层,也是json文件参数四字符串中this指代的对象
		if(layer.fun) layer.fun();//运行函数
		for(var i=0;i<layer[0];i++) {//向上的核心部分
			catCan.catStackTop--;
			ctx.restore();
		}
		var tx = layer[6]||0;
		var ty = layer[7]||0;
		layer[5] = layer[5]||0;

		ctx.save();//以下几行是入栈操作
		var txy = catCan.catStoreTxy[catCan.catStackTop] = {};//移轴相关
		txy.tx = tx;
		txy.ty = ty;
		var rxy = catCan.catStoreRxy;//计算真实坐标相关
		var rxyn = rxy[catCan.catStackTop] = {};
		var pre = catCan.catStackTop-1;
		rxyn.an = rxy[pre].an+layer[5];
		var cos=Math.cos(rxy[pre].an),sin=Math.sin(rxy[pre].an),xt=tx*ct,yt=ty*ct;
		rxyn.rx = rxy[pre].rx+xt*cos-yt*sin;//图层坐标轴的真实坐标(在原来的基础上计算)
		rxyn.ry = rxy[pre].ry-yt*cos-xt*sin;

		ctx.translate(xt,yt);//移动轴
		ctx.rotate(layer[5]);//旋转坐标系
		ctx.scale(layer[8],layer[9]);//缩放

		var dx = layer[2] - tx;
		var dy = layer[3] - ty;
		layer.rx = rxyn.rx+dx*ct;//图像真实坐标
		layer.ry = rxyn.ry+dy*ct;
		catCan.catStackTop++;

		var catImg = catCan.catTreeImg[layer[1]];
		var img = catCan.catTreePic[catImg[0]];

		ctx.drawImage(img,catImg[1],catImg[2],catImg[3],catImg[4],dx*ct,dy*ct,catImg[3]*ct,catImg[4]*ct);//画图
		if(catCan.catFlag) {//标出轴的位置
			ctx.fillStyle = "rgb(200,0,0)";//调试用红点(表示坐标轴)
			ctx.fillRect(0,0,5,5);//调试用红点
		}
	};
	this.catRequestAnimationFrameId = requestAnimationFrame(loop);
};

CatCan.prototype.stop = function() {//停止动画,表现为暂停
	if(this.catRequestAnimationFrameId==0) return;
	cancelAnimationFrame(this.catRequestAnimationFrameId);
	this.catRequestAnimationFrameId = 0;
	console.log("Animation "+this.listNo+" stopped.");
};

CatCan.prototype.next = function() {//下一动画
	var newAni = this.channel.shift();
	if(newAni!=undefined) {//有内容
		var a = this.catTreePlay[newAni.playNo].ani;//某动画各图层的根节点
		var no = {dx:2,dy:3,fun:4,an:5,tx:6,ty:7,sx:8,sy:9};//映射关系
		for(var i in newAni) {
			if(i=="playNo") continue;
			var na = newAni[i],ii=parseInt(i)+1;
			for(var j in na) {
				a[ii][no[j]] = j=="fun"||j=="an"?na[j]:na[j]/this.catTimes;//修改参数
			}
		}
		this.listNo = newAni.playNo;
	}
	this.play();
};

CatCan.prototype.push = function(data/*json*/,max/*number*/) {//向末尾追加,返回队列中动画数
	/*
		data格式:
		{
			playNo:动画序号*,
			aniNo:{
				dx:绘制的位置x/2,
				dy:绘制的位置y/3,
				fun:执行函数体/4,
				an:旋转角度/5,
				tx:移轴x/6,
				ty:移轴y/7,
				sx:缩放x/8,
				sy:缩放y/9
			}
		}
		max:队列中允许缓存的动画数,(max>=1)
	*/
	if(data.playNo==undefined) {
		console.error("Data(push) missed 'playNo'.");
		return;
	}
	if(max>0&&this.channel.length>max) this.channel.shift();//超了的话把最前面的清除
	return this.channel.push(data);
};

CatCan.prototype.unshift = function(data/*json*/) {//向开头插入,返回队列中动画数
	/*data格式同push*/
	if(data.playNo==undefined) {
		console.error("Data(unshift) missed 'playNo'.");
		return;
	}
	this.channel = [];//会清空动画队列
	return this.channel.unshift(data);
};

CatCan.prototype.addListener = function(listener/*string||标签*/,fun/*function*/) {//响应器
	/*
		参数列表:
		1.需要被添加鼠标动作监听器的对象,如果是字符串则会以该字符串作为id查找对象
		2.执行的回调函数,回调函数的参数为包含如下五个属性与若干函数的对象:
			1)cx(number类型):相对于canvas左上角坐标的x值
			2)cy(number类型):相对于canvas左上角坐标的y值
			3)x(number类型):相对于listener左上角坐标的x值
			4)y(number类型):相对于listener左上角坐标的y值
			5)event(string类型):正在执行的动作,解释如下:
				"drag":拖动
				"move":移动
				"down":按下
				"up":抬起
			函数列表:
				drag(listNo,aniNo):该图层可以拖动
				click(listNo,aniNo,fun):该图层被点击后会执行回调函数
	*/
	var catCan = this;
	if(typeof listener==="string") {//处理listener
		listener = document.getElementById(listener);
		if(listener===null) {//如果id找不到
			console.error("Function'addListener',parameter 1 is not a right parameter.");
			return;
		}
	}
	listener.addEventListener("mousemove",function(e) {fun(getData(0,e));},false);
	listener.addEventListener("mousedown",function(e) {fun(getData(1,e));},false);
	listener.addEventListener("mouseup",function(e) {fun(getData(2,e));},false);

	function getData(moveFlag,e) {
		var cRect = catCan.canvas.getBoundingClientRect();
		var cx = e.clientX - cRect.left;//相对于canvas左上角的坐标
		var cy = e.clientY - cRect.top;
		var lRect = listener.getBoundingClientRect();
		var x = e.clientX - lRect.left;
		var y = e.clientY - lRect.top;
		var event;//触发的动作:drag,move,up,in,out
		switch(moveFlag) {
			case 0:
				if(e.buttons) event="drag";
				else event="move";
				break;
			case 1:
				event="down";break;
			case 2:
				event="up";break;
		}
		return new Mouse(x,y,cx,cy,event);
	};


	function Mouse(x,y,cx,cy,event) {
		this.x = x;
		this.y = y;
		this.cx = cx;
		this.cy = cy;
		this.event = event;
	}
	Mouse.prototype.drag = function(listNo/*number*/,aniNo/*number*/) {
		var layer = catCan.catTreePlay[listNo].ani[aniNo+1];
		if(this.event=="up") {//这个this指return的对象,也就是addListener方法function自带的参数mouse
			layer.follow = null;
			return;
		} else if(catCan.inArea(this,listNo,aniNo,"down")) {
			var follow = layer.follow = {};
			follow.flag = true;
			var area = catCan.getArea(listNo,aniNo);
			follow.l = this.cx - area.left;
			follow.t = this.cy - area.top;
		}
		if(!layer.follow||!layer.follow.flag) return;
		var dx=this.cx-layer.follow.l,//四个参数
		dy=this.cy-layer.follow.t,
		tx=this.cx-layer.follow.l,
		ty=this.cy-layer.follow.t;
		var t=null;
		if(catCan.channel[0]&&catCan.channel[0].playNo==listNo) {//如果管道里有动画且只是修改当前动画
			t = catCan.channel[0];
			t[aniNo] = {dx:dx,dy:dy,tx:tx,ty:ty};
		} else {
			t = {playNo:listNo};
			t[aniNo] = {dx:dx,dy:dy,tx:tx,ty:ty};
			catCan.push(t);
		}
		layer.dx=dx,//同时修改当前动画
		layer.dy=dy,
		layer.tx=tx,
		layer.ty=ty
	};
	Mouse.prototype.click = function(listNo/*number*/,aniNo/*number*/,fun) {
		var layer = catCan.catTreePlay[listNo].ani[aniNo+1];
		if(catCan.inArea(this,listNo,aniNo,"down")) {
			layer.click = true;
			setTimeout(function(){layer.click=false;},500);
		} else if(catCan.inArea(this,listNo,aniNo,"up")) {
			if(layer.click) {
				fun();
			}
			setTimeout(function(){layer.click=false;},500);
		}
	};
	Mouse.prototype.dblclick = function(listNo/*number*/,aniNo/*number*/,fun) {
		var layer = catCan.catTreePlay[listNo].ani[aniNo+1];
		if(catCan.inArea(this,listNo,aniNo,"down")) {//点击区域内
			if(!layer.dblclick) layer.dblclick=1;
			else if(layer.dblclick==2) layer.dblclick=3;
			setTimeout(function(){layer.dblclick=false;},500);
		} else if(catCan.inArea(this,listNo,aniNo,"up")) {
			if(layer.dblclick==1) layer.dblclick=2;
			else if(layer.dblclick==3) {
				fun();
				layer.dblclick=0;
			}
			setTimeout(function(){layer.dblclick=false;},500);
		}
	};
};

CatCan.prototype.getArea = function(listNo/*number*/,aniNo/*number*/) {//获取范围
	/*
		参数列表:
		1.列表序号*
		2.图层序号*
	*/
	var catCan = this;
	var layer = this.catTreePlay[listNo].ani[aniNo+1];
	var img = this.catTreeImg[layer[1]];
	var left=layer.rx,top=-layer.ry,width=img[3]*catCan.catTimes,height=img[4]*catCan.catTimes;
	var right=left+width,bottom=top+height;
	return {
		left:left,
		top:top,
		width:width,
		height:height,
		right:right,
		bottom:bottom
	}
};

CatCan.prototype.inArea = function(mouse,listNo/*number*/,aniNo/*number*/,event/*string*/) {//区域判定,返回boolean,和响应器配合比较好用
	/*
		参数列表:
		1.鼠标事件*
		2.列表序号*
		3.图层序号*
		4.匹配的动作
	*/
	if(event&&event!==mouse.event) return false;
	var a = this.getArea(listNo,aniNo);
	if(mouse.cx>=a.left&&mouse.cx<=a.right
		&&mouse.cy>=a.top&&mouse.cy<=a.bottom) 
	return true;
};

var CatCanTool = CatCan.prototype.tool = {//工具集
	/*
		函数工具集约定/提倡如下规范:
		函数命名符合如下正则表达式,
		即"两个小写字母"+任意组"一个大写字母后跟两个小写字母":
			/[a-z]{2}([A-Z]{1}[a-z]{2})+\(-?[\w.]*(,-?[\w.]*)*\);?/
		可供使用的参数:
			f:function 表示函数为该动画的第几个预处理函数
			ps:parameters 参数集
		返回值:
			{
				"data": data,//Array(数组类型),运算得出的数组集合
				"flag": 0,//Number(整数类型),图像初始化时选用的数据所对应的数组角标
				"fun": fun//String待执行的函数体字符串
			};
		想访问返回值中的data数组可使用类似的写法,f的定义见"可供使用的参数":
			this.data[f]
		想访问当前帧某动画切片调用的数组数据的角标可使用类似的写法:
			this.data[f].flag
		想修改当前帧某动画切片某一属性可使用类似的写法,n为不同值时代表不同的属性:
			this[2] += 100;//该切片向右平移100像素
		函数编写规范:
			1.判断参数个数
			2.生成数组集合(如果需要)
			3.返回结果
	*/
};