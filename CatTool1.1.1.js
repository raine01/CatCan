//drFlaBirCha:drawFlappyBirdChannel(仿照flappybird的管道)
CatTool.drFlaBirCha = function(f,ps,ctx) {
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
		text: fun
	};
};

//trEll: translateEllipse(按椭圆方式移动轴)
CatTool.trEll = function(f,ps,ctx) {
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
	points.flag = 0;
	var fun = "var df=this.data["+f+"];this[6]=df[df.flag].x;this[7]=df[df.flag].y;df.flag+="+ps[2]+";if(df.flag<0)df.flag+=df.length;if(df.flag>=df.length)df.flag-=df.length;";
	return {
		data: points,
		text: fun
	};
};

//drEll:drawEllipse(按椭圆方式绘图)
CatTool.drEll = function(f,ps,ctx) {
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
	var step = (ps[0]>ps[1])?1/ps[0]:1/ps[1],points=[];
	for(var i=0;i<2*Math.PI;i+=step) {
		var point={
			x:x+ps[0]*Math.cos(i),
			y:y+ps[1]*Math.sin(i)
		};
		points.push(point);
	}
	points.flag = 0;
	var fun = "var df=this.data["+f+"];this[2]=df[df.flag].x;this[3]=df[df.flag].y;df.flag+="+ps[2]+";if(df.flag<0)df.flag+=df.length;if(df.flag>=df.length)df.flag-=df.length;";
	return {
		data: points,
		text: fun
	};
};

//anClo:angleClock(按照钟摆的方式旋转轴)
CatTool.anClo = function(f,ps,ctx) {
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
	ds.flag = 0;
	var fun = "var df=this.data["+f+"];this[5]=df[df.flag];df.flag++;if(df.flag>=df.length)df.flag-=df.length;";
	return {
		data: ds,
		text: fun
	};
};

//wrTxt:writeText(打印文字)
CatTool.wrTxt = function(f,ps,ctx) {
	/*
		参数:
		1.行数
		2.每行字数(可选,默认20)
		使用方法:
		1)获取到数据域的wait字段
		w = catCan.getDataSpace(0,0,0).wait;
		2)wait字段是一个队列,将想要打印的信息追加到队列末尾,
		会第一时间打印在特定图层上方
		w.push(String(new Date()));
	*/
	var data = {
		screen:[],
		wait:[]
	};
	var fun = function() {
		var max=ps[0],length=ps[1]||20;
		var s=data.screen,w=data.wait,size=ctx.font.match(/\d+/);
		if(w.length>0) {//如果等待队列有东西
			var m = w.shift();
			s.push(m.slice(0,length));
			if(s.length>max) s.shift();
			while(m.length>length) {
				m = m.slice(length);
				s.push(m.slice(0,length));
				if(s.length>max) s.shift();
			}
		}
		for(var i in s) {
			ctx.fillText(s[i],0,size*(parseInt(i)+1));
		}
	};
	return {
		data:data,
		fun:fun
	};
};

//chTxtFon:changeTextFont(修改字体大小)
CatTool.chTxtFon = function(f,ps,ctx) {
	/*
		参数:
		1.字号
	*/
	var font = ps[0]+"px sans-serif";
	var fun = function() {
		ctx.font = font;
	};
	return {
		fun:fun
	}
};