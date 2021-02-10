//drFlaBirCha:drawFlappyBirdChannel(仿照flappybird的管道)
CatCanTool.drFlaBirCha = function(f,ps) {
	/*
		参数:
		1.通道y轴最大偏移值
		2.通道y轴最小偏移值
		3.通道x轴初始值
		4.移动速度(可选)
	*/
	if(ps.length<3) {
		console.error("Function 'drFlaBirCha' missing argument.");
		return;
	}
	var max=parseInt(ps[0]),min=parseInt(ps[1]),x0=parseInt(ps[2]),speed=parseInt(ps[3])||1;
	var domain=max-min;
	var fun = "if(this[2]<=0){var df=this.data["+f+"];this[2]="+x0+";var d=parseInt(Math.random()*"+domain+"+"+min+");df.push(d);this[3]=df.shift();}else{var df=this.data["+f+"];console.log(df[0]);this[2]-="+speed+";}";
	return {
		data: [min,max],
		flag: 0,
		fun: fun
	};
};

//trEll: translateEllipse(按椭圆方式移动轴)
CatCanTool.trEll = function(f,ps) {
	/*
		参数:
		1.x半轴
		2.y半轴
		3.速度
		4.中心横坐标(可选)
		5.中心纵坐标(可选)
	*/
	if(ps.length<3||ps.length==4) {
		console.error("Function 'trEll' missing argument.");
		return;
	}
	
	ps = ps.map(Number);//字符串数组转数字数组
	var x=ps[3]||0,y=ps[4]||0;
	var step = (ps[0]>ps[1])?1/ps[0]:1/ps[1],points = [];
	for(var i=0;i<2*Math.PI;i+=step) {
		var point={
			x:x+ps[0]*Math.cos(i),
			y:y+ps[1]*Math.sin(i)
		};
		points.push(point);
	}
	var fun = "var df=this.data["+f+"];this[6]=df[df.flag].x;this[7]=df[df.flag].y;df.flag+="+ps[2]+";if(df.flag<0)df.flag+=df.length;if(df.flag>=df.length)df.flag-=df.length;";
	return {
		data: points,
		flag: 0,
		fun: fun
	};
};

//drEll:drawEllipse(按椭圆方式绘图)
CatCanTool.drEll = function(f,ps) {
	/*
		参数:
		1.x半轴
		2.y半轴
		3.速度(整数)
		4.中心横坐标(可选)
		5.中心纵坐标(可选)
	*/
	if(ps.length<3||ps.length==4) {
		console.error("Function 'drEll' missing argument.");
		return;
	}

	ps = ps.map(Number);//字符串数组转数字数组
	var x=ps[3]||0,y=ps[4]||0;
	var step = (ps[0]>ps[1])?1/ps[0]:1/ps[1],points=[];//f:fun
	for(var i=0;i<2*Math.PI;i+=step) {
		var point={
			x:x+ps[0]*Math.cos(i),
			y:y+ps[1]*Math.sin(i)
		};
		points.push(point);
	}
	var fun = "var df=this.data["+f+"];this[2]=df[df.flag].x;this[3]=df[df.flag].y;df.flag+="+ps[2]+";if(df.flag<0)df.flag+=df.length;if(df.flag>=df.length)df.flag-=df.length;";
	return {
		data: points,
		flag: 0,
		fun: fun
	};
};

//anClo:angleClock(按照钟摆的方式旋转轴)
CatCanTool.anClo = function(f,ps) {
	/*
		参数:
		1.摆动最大值
		2.速度
		3.初始值(可选)
	*/
	if(ps.length<2) {
		console.error("Function 'anClo' missing argument.");
		return;
	}

	ps = ps.map(Number);
	var d = Math.PI/180;//d:degree;
	var dn=d*ps[1],ds=[];//dn:degree/n;ds:[degree/n]s
	var i0 = ps[2]||0;
	for(var i=i0*d;i<(i0+ps[0]-1)*d;i+=dn) {
		ds.push(i);
	}
	for(var i=(i0+ps[0]-1)*d;i>i0*d;i-=dn) {
		ds.push(i);
	}
	var fun = "var df=this.data["+f+"];this[5]=df[df.flag];df.flag++;if(df.flag>=df.length)df.flag-=df.length;";
	return {
		data: ds,
		flag: 0,
		fun: fun
	};
};