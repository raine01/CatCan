//drawFloor
CatTool.drawFloor = function(para,ani,ctx,ds) {
	/*
		参数:
			无
		根数据域占用:
			map只读不写,格式如下(按x1从小到大排序):
			[
				[x1,x2,y],
				[x1,x2,y],
				...
				[x1,x2,y]
			]
		返回结果:
			fun
			data(空)
	*/
	if(!ds.map) ds.map = [];
	var fun = function() {
		for(var i in ds.map) {
			var d = ds.map[i];
			ctx.beginPath();
			ctx.moveTo(d[0],d[2]);
			ctx.lineTo(d[1],d[2]);
			ctx.stroke();
		}
	};
	return {
		data: [],
		fun: fun
	};
};

//moveOnFloor
CatTool.moveOnFloor = function(para,ani,ctx,ds) {
	/*
		ad控制移动,w悬停,s下降或加速掉落,space跳跃
		参数:
		1.移动的速度,0为静止(默认5)
		2.是否可以横向离开平面
			0表示可以离开所有平面
			1表示可以离开当前地面但是不允许离开下方最辽阔的平面
			2表示不允许离开当前平面
		根数据域占用:
			map只读不写,格式如下(按x1从小到大排序):
			[
				[x1,x2,y],
				[x1,x2,y],
				...
				[x1,x2,y]
			]
		返回结果:
			data:(表示当前正在做什么动作)
				空字符串/left/right/up/down
	*/
	var speed = parseInt(para[0])||5;//默认速度为5
	var leave = parseInt(para[1])||0;//默认可以横向离开所有平面,不允许离开所有地面
	var w=ani.dx-ani.tx,h=ani.dy-ani.ty;
	var data = {action:""};
	//动作设置
	ctx.parentCan.addKeyListener(function(type,key){
		if(type=="keydown") {
			switch(key) {
				case "w":data.action+="up";data.action=data.action.replace(/(up){2,}/g,"up");break;
				case "a":data.action="left";break;
				case "s":data.action="down";break;
				case "d":data.action="right";break;
			}
		} else if(type=="keyup") {
			var beReplace = "";
			switch(key){
				case " ":data.action+="jump";setTimeout(function(){data.action=data.action.replace("jump","");},400);break;
				case "w":beReplace=/up/g;break;
				case "a":beReplace=/left/g;break;
				case "s":beReplace=/down/g;break;
				case "d":beReplace=/right/g;break;
			}
			data.action = data.action.replace(beReplace,"");
		}
	});
	var fun = function() {
		var mayFloor=[],realFloor=[0,0,Number.MAX_VALUE],
			l=Number.MAX_VALUE,r=-Number.MAX_VALUE;//脚下所有地板的边界
		for(i in ds.map){
			if(ani.tx>ds.map[i][1])continue;
			if(ani.ty>ds.map[i][2])continue;
			if(ani.tx<ds.map[i][0])break;
			mayFloor.push(ds.map[i]);
		}
		for(i in mayFloor){
			if(mayFloor[i][2]<realFloor[2])realFloor=mayFloor[i];//最上方的地板
			if(mayFloor[i][0]<l)l=mayFloor[i][0];//寻找脚下所有地板的左边界
			if(mayFloor[i][1]>r)r=mayFloor[i][1];//寻找脚下所有地板的右边界
		}
		if(realFloor[2]-speed>ani.ty){ani.ty+=speed;ani.dy+=speed;}
		else {ani.ty=realFloor[2];ani.dy=realFloor[2]+h;}
		//jump
		if(data.action.indexOf('jump')!=-1){
			var jumpSpeed=(Math.min(data.action.match(/jump/g).length+1,3))*speed;
			ani.ty-=jumpSpeed;ani.dy-=jumpSpeed;
		}
		//left
		if(data.action.indexOf('left')!=-1){
			if(leave==1&&ani.tx-speed<l){ani.tx=l;ani.dx=l+w;}
			else if(leave==2&&ani.tx-speed<realFloor[0]){ani.tx=realFloor[0];ani.dx=realFloor[0]+w;}
			else{ani.tx-=speed;ani.dx-=speed;}
		} 
		//right
		if(data.action.indexOf('right')!=-1){
			if(leave==1&&ani.tx+speed>r){ani.tx=r;ani.dx=r+w;}
			else if(leave==2&&ani.tx+speed>realFloor[1]){ani.tx=realFloor[1];ani.dx=realFloor[1]+w;}
			else{ani.tx+=speed;ani.dx+=speed;}
		}
		//up
		if(data.action.indexOf('up')!=-1){ani.ty-=speed;ani.dy-=speed;}
		//down
		if(data.action.indexOf('down')!=-1){ani.ty+=speed;ani.dy+=speed;}
	};
	return {
		data:data,
		fun:fun
	};
};

//changeImg
CatTool.changeImg = function(para,ani,ctx,ds) {
	/*
		在四个列表中根据键盘的a和d以及抬起按键来切换四个小动画,该组件可能复用性不强
		参数:
			1.多少帧修改一次图片(默认三十帧)
		数据域占用的栗子:
			//贴图列表,数组中的1-8是img的角标
			catCan.dataSpace.imgs = {
				leftwait:[1,2],//左待机
				leftmove:[3,4],//左走路
				rightwait:[5,6],//右待机
				rightmove:[7,8]//右走路
			};
			for(i in catCan.dataSpace.imgs) {
				catCan.dataSpace.imgs[i].flag = 0;//flag的赋值不可缺少
			}
	*/
	var time = parseInt(para[0])||30;//默认时间为30,约半秒
	ds.timestamp = 0;
	ds.action = "rightwait";
	//动作设置
	ctx.parentCan.addKeyListener(function(type,key){
		if(type=="keydown") {
			switch(key) {
				case "a":
					ds.action = "leftmove";
					break;
				case "d":
					ds.action = "rightmove";
			}
		} else if(type=="keyup") {
			ds.action=ds.action.replace("move","wait");
		}
	});
	var fun = function() {
		ds.timestamp=(ds.timestamp+1)%time;//该时间戳每秒增加60个值
		if(ds.timestamp==0) {//如果归零
			var imgList = ds.imgs[ds.action];
			imgNo=(imgList.flag+1)%imgList.length;
			var ciNo = imgList[imgNo];
			ani.ci = ciNo;//更新贴图数据
			imgList.flag = imgNo;
		}
	};
	return {
		fun:fun
	};
};

//drawArea
CatTool.drawArea = function(para,ani,ctx,ds) {
	/*
		参数:
			类名
		根数据域占用:
			aboutHp只读不写,格式如下:
			class为类名,同类名才会计算hp
			数组内容为x1,y1,x2,y2,hp相加的值
			{
				class1:[
					[0,0,100,100,-0.1],
					[100,0,200,100,-10]
				],
				class2:[
					[0,0,100,100,-0.1],
					[100,0,200,100,-10]
				]
			}
		返回结果:
			fun
			data(空)
	*/
	if(!ds.aboutHp) ds.aboutHp = [];
	var fun = function() {
		var clazz = para[0]||"";//默认为空
		var aboutIt = ds.aboutHp[clazz];
		for(i in aboutIt){
			var d = aboutIt[i];
			ctx.globalCompositeOperation = "destination-over";
			if(d[4]>0) ctx.fillStyle="green";
			else ctx.fillStyle="red";
			ctx.fillRect(d[0],d[1],d[2]-d[0],d[3]-d[1]);
		}
	};
	return {
		data: [],
		fun: fun
	};
};

//aboutHp
CatTool.aboutHp = function(para,ani,ctx,ds) {
	/*
		hp的计算与显示
		根数据域占用:
			aboutHp只读不写,格式如下:
			class为类名,同类名才会计算hp
			数组内容为x1,y1,x2,y2,hp相加的值
			{
				class1:[
					[0,0,100,100,-0.1],
					[100,0,200,100,-10]
				],
				class2:[
					[0,0,100,100,-0.1],
					[100,0,200,100,-10]
				]
			}
		参数:
			1.class名字,默认为空
			2.字体大小,为空不显示
			3.绘制x值
			4.绘制y值
	*/
	var clazz = para[0]||"";//默认为空
	var size = parseInt(para[1]);//不写的话不显示hp
	var data = {
		maxHp:100,
		hp:100
	};
	if(!ds.aboutHp) ds.aboutHp = [];
	var count = function() {//计算hp
		var aboutIt = ds.aboutHp[clazz];
		for(i in aboutIt){
			var space = aboutIt[i];
			if(ani.tx>=space[0]&&ani.ty>=space[1]
				&&ani.tx<=space[2]&&ani.ty<=space[3])//如果xy都在范围内
				data.hp+=space[4];
			if(data.hp>data.maxHp) data.hp=data.maxHp;
			if(data.hp<0) data.hp=0;
		}
	};
	if(!size) {//如果不显示hp
		return {
			data:data,
			fun:count
		};
	}
	var x = parseInt(para[2])||0;//字体左上角默认坐标为0,0
	var y = parseInt(para[3])+size||size;
	var showHp = function() {
		//ctx.fillStyle="rgb(255,255,255)";//颜色
		count();
		ctx.font=size+"px Arial";
		ctx.fillText("HP "+parseInt(data.hp),x,y);
	};
	return {
		data:data,
		fun:showHp
	};
};

//barrage
CatTool.barrage = function(para,ani,ctx,ds) {
	/*
		与aboutHp搭配使用,原理为给共用数据域赋值
		参数:
			1.class名字
			2.x轴速度
			3.y轴速度
			4.血量变化
			5.频率(帧为单位)
	*/

};