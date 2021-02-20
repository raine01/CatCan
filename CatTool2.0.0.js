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
	var data = {
		action:""
	};
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
		if(realFloor[2]-speed>ani.ty){
			ani.ty+=speed;
			ani.dy+=speed;
		} else {
			ani.ty=realFloor[2];
			ani.dy=realFloor[2]+h;
		}
		//jump
		if(data.action.indexOf('jump')!=-1){
			var jumpSpeed=(Math.min(data.action.match(/jump/g).length+1,3))*speed;
			ani.ty-=jumpSpeed;
			ani.dy-=jumpSpeed;
		}
		//left
		if(data.action.indexOf('left')!=-1){
			if(leave==1&&ani.tx-speed<l) {
				ani.tx=l;
				ani.dx=l+w;
			} else if(leave==2&&ani.tx-speed<realFloor[0]) {
				ani.tx=realFloor[0];
				ani.dx=realFloor[0]+w;
			} else {
				ani.tx-=speed;
				ani.dx-=speed;
			}
		} 
		//right
		if(data.action.indexOf('right')!=-1){
			if(leave==1&&ani.tx+speed>r) {
				ani.tx=r;
				ani.dx=r+w;
			} else if(leave==2&&ani.tx+speed>realFloor[1]) {
				ani.tx=realFloor[1];
				ani.dx=realFloor[1]+w;
			} else {
				ani.tx+=speed;
				ani.dx+=speed;
			}
		}
		//up
		if(data.action.indexOf('up')!=-1){
			ani.ty-=speed;
			ani.dy-=speed;
		}
		//down
		if(data.action.indexOf('down')!=-1){
			ani.ty+=speed;
			ani.dy+=speed;
		}
	};
	return {
		data:data,
		fun:fun
	};
};