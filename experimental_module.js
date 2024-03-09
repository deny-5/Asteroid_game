
let sprite1 = 
[
    [-10,-70],[-60,-40],[-70,0],[-50,60],
    [-5,40],[-30,75],[10,80],[55,60],
    [80,-30],[5,10],[50,10],[55,-55]
];

let sprite2 =
[
	[-10,-30],[-11,-28],[-18,-27],[-22,-30],[-28,-35],[-31,-39],[-32,-25],[-30,-12],[-23,2],[-14,10],[-5,13],
	[5,14],[-6,14],[-14,11],[-19,16],[-22,24],[-21,30],[-16,36],[-6,37],[4,33],[-1,36],[7,39],[15,40],[21,38],
	[25,33],[25,27],[24,19],[19,10], [17,0],[16,-5],[15,-6],[10,-7],[1,-11],[-6,-19],[-8,-24],[-9,-29],[-8,-31],
	[-5,-33],[-6,-35],[-8,-41],[-9,-45],[-10,-48],[-13,-53],[-17,-57],[-22,-60],[-23,-55],[-24,-59],[-28,-58],
	[-31,-54],[-32,-49],[-31,-43],[-29,-38],[-25,-34],[-20,-30],[-14,-28]
];

let sprite3 = 
[
	[0,-33],
	[-15,13],
	[-7.5,5],
	[7.5,5],
	[15,13]
];

let sprite4 = 
[
	//1		2		3		4		5
	[-3.2,40.1],[0,43],[10,44.6],[20,43.4],[26,39.3],
	//6		7		8		9		10
	[20,35.5],[10,34.8],[0,36.8],[-1.9,37.8],[-2.5,41.4],
	//11	12		13		14		15
	[4.9,44.2],[14.9,44.4],[23.2,42.3],[25.8,40],[25.5,44.7],
	//16 	17		18		19		20
	[19.6,-19.9],[19.4,-22.6],
	//21	22		23		24		25
	[18.1,-24.3],[10,-26.8],[-10,-29.5],[-20,-29.7],
	//26	27		28		29		30
	[-30.1,-27.4],[-33.4,-24.7],[-33.6,-23.5],[-33.2,-20],[-33.3,-20.4],
	//31	32		33		34		35
	[-33.6,-20.6],[-35.5,-22.8],[-36.2,-28.9],[-36,-30.1],[-33.7,-32.4],
	//36	37		38		39		40
	[-30,-34.1],[-25.1,-35.4],[-20,-36.1],[-15,-36.2],[-10,-35.8],
	//41	42		43		44		45
	[10,-33.1],[20.1,-29.6],[20.8,-28.2],
	//46	47		48		49		50
	[21.3,-22.9],[20.2,-20.4],[21.3,-21.9],[20.7,-24.2],[10,-27.7],
	//51	52		53		54		55
	[-10,-35.8],[-20,-30.6],[-24.7,-29.9],[-30,-28.4],
	//56	57		58		59		60
	[-33.9,-26.4],[-35.6,-23.5],[-33.3,-20.8],[-32.4,-12.4],[-31.3,-9.5],
	//61	62		63		64		65
	[-28.3,-6.6],[-20,-4.2],[-10,-2.4],[-7.5,0.2],
	//66	67
	[-3.3,39.7]
];

/*
    Конструктор объекта астероид
    Атрибуты:
        ID          идентификатор объекта
        sprite      массив точек картинки
        pos         массив координат
        dx          приращение Х координаты
        dy          приращение у координаты
        dPhi        приращение угла поворота
        moveMatrix  матрица сдвига
    Методы:
        matrixMultiply      произведение матриц
        rotate              поворот на заданный угол
*/

let delayTimer =
{
	count: 0,
	deathCount: 3,
	active: false,
	
	storage: null,
	
	tick: function(){this.count++;},
}

let onTouchHandler = 
{
	getVector : function(selfMass, selfSpeedArr, otherMass, otherSpeedArr, posSelf, posOther)
	{
		let angleNorm = this.getAngleNorm(posOther[1], posSelf[1], posOther[0], posSelf[0]);
		let straitTransformMatrix = this.getDirMatrix(angleNorm);
		let backTransformMatrix = this.getDirMatrix(-angleNorm);
		let selfNormVect = this.matrixMultiplyRight(straitTransformMatrix, selfSpeedArr);
		let otherNormVect = this.matrixMultiplyRight(straitTransformMatrix, otherSpeedArr);
		let newSelfNormVect = this.changeVectorNorm(selfMass, selfNormVect, otherMass, otherNormVect);
		let newSelfVector = this.matrixMultiplyRight(backTransformMatrix, newSelfNormVect);
		return newSelfVector;
	},

	getPrecisionPos : function(obj1, obj2)
	{
		const obj1pos = obj1.pos.slice();
		const obj1Npos = obj1.newpos.slice();
		const obj2pos = obj2.pos.slice();
		const obj2Npos = obj2.newpos.slice();
		const obj1rad = obj1.radius;
		const obj2rad = obj2.radius;

		const normal = obj1rad + obj2rad;
		const deltaXobj1 = (obj1Npos[0] - obj1pos[0])/10000;
		const deltaYobj1 = (obj1Npos[1] - obj1pos[1])/10000;
		const deltaXobj2 = (obj2Npos[0] - obj2pos[0])/10000;
		const deltaYobj2 = (obj2Npos[1] - obj2pos[1])/10000;

		flag = true;

		while(flag)
		{
			obj1pos[0] += deltaXobj1;
			obj1pos[1] += deltaYobj1;
			obj2pos[0] += deltaXobj2;
			obj2pos[1] += deltaYobj2;
			const deltaX = Math.abs(obj1pos[0] - obj2pos[0]); 
			const deltaY = Math.abs(obj1pos[1] - obj2pos[1]);
			const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
			if (distance < normal)
			{
				obj1.newpos = obj1pos;
				obj2.newpos = obj2pos;
				flag = false;
			}
		}
	},
	
	getAngleNorm(pos2y, pos1y, pos2x, pos1x)
	{
		return -Math.atan2((pos2y-pos1y),(pos2x-pos1x));
	},
	
	getDirMatrix : function(angle)
    {
        let cos = Math.cos(angle); // * Math.PI/180
        let sin = Math.sin(angle);
        let dirMatrix = [[],[]];
        
		dirMatrix[0][0] = Math.round(cos*1000000)/1000000;
		dirMatrix[0][1] = -Math.round(sin*1000000)/1000000;
		dirMatrix[1][0] = Math.round(sin*1000000)/1000000;
		dirMatrix[1][1] = Math.round(cos*1000000)/1000000;

        return dirMatrix;
	},
	
	matrixMultiplyRight : function(squareMatrix, columnMatrix)
	{
		let newColumn = [];
		for(let i = 0; i<columnMatrix.length; i++)
		{
			let summOfRow = 0;
			for(let j = 0; j<squareMatrix[i].length; j++)
			{
				summOfRow += squareMatrix[i][j]*columnMatrix[j];
			}
			newColumn.push(summOfRow);		
		}
		return newColumn;
	},

	matrixMultiplyLeft : function (posArr, matrix)
    {
        let newPos = [];
        for(let i = 0; i < matrix.length; i++)
        {
            let newCord = 0;
            for(let j = 0; j< posArr.length; j++)
            {
                newCord += Math.round((posArr[j]*matrix[j][i])*1000000)/1000000;
            }
           newPos.push(newCord); 
        }
        
        return newPos;
    },
	
	changeVectorNorm: function(selfMass, selfNormVect, otherMass, otherNormVect)
	{
		let coef1 = selfMass - otherMass;
		let coef2 = otherMass * 2;
		let coef3 = selfMass + otherMass;
		selfNormVect[0] = (coef1*selfNormVect[0] + coef2*otherNormVect[0])/coef3;
		return selfNormVect;
	}

}
//////////////////////////////////////////////////////////////////////////////////////////////////////
Asteroid = function(spriteArr, num)
{
	this.id = `asteroid_${num}`;
	this.sprite = spriteArr.slice();
	this.m = 4;
	this.deathFlag = true;
	this.pos = [0,0,1];
    this.newpos = [0,0,1];
    this.radius = 70;                              //55
	this.dx = 0;
	this.dy = 0;
	this.dPhi = 0;
	this.moveMatrix =
	[
        [1,0,0],
        [0,1,0],
        [0,0,1],
    ];
	this.matrixMultiply = function(posArr, matrix)
    {
        let newPos = [];
        for(let i = 0; i < matrix.length; i++)
        {
            let newCord = 0;
            for(let j = 0; j< posArr.length; j++)
            {
                newCord += Math.round((posArr[j]*matrix[j][i])*1000000)/1000000;
            }
           newPos.push(newCord); 
        }
        
        return newPos;
    },

	this.getSmallerSprite = function()
	{
		let arr = [];
		for (let i = 0; i<this.sprite.length; i++)
		{
			let pair = [];
			pair.push(this.sprite[i][0]/2);
			pair.push(this.sprite[i][1]/2);
			arr.push(pair);
		}
		return arr;
	}

    this.rotate = function(angle)
    {
		
        let cos = Math.cos(angle * Math.PI/180);
        let sin = Math.sin(angle * Math.PI/180);
        let matrix =
        [
            [ Math.round(cos*1000000)/1000000, Math.round(sin*1000000)/1000000 ],
            [ -Math.round(sin*1000000)/1000000, Math.round(cos*1000000)/1000000 ]
        ];
        let arr = [];
        for (let i = 0; i < this.sprite.length; i++)
        {
            arr.push(this.matrixMultiply(this.sprite[i], matrix));
        }
        return arr;
    }
	
	this.onTouch = onTouchHandler;
}

Ship = function(spriteArr)
{
	this.id = "ship"
	this.sprite = spriteArr.slice();
	this.m = 1.2 ;
	this.pos = [0,0,1];
    this.newpos = [0,0,1];
    this.radius = 33;
	this.dx = 0;
	this.dy = 0;
	this.d2x = 0;
	this.d2y = 0;
	this.phi = 0;
	this.dPhi = 0;
	
    this.maxSpeed = 40;

	this.flag = 1;
	this.deathFlag = true;
		
	this.dirMatrix = [[0,0],[0,0]];
	this.moveMatrix =
	[
        [1,0,0],
        [0,1,0],
        [0,0,1],
    ];
	
	this.stopChecker = function()
	{
		if (this.flag == 1) return;
		else
		{
			let a = Math.abs(this.dx);
			let b = Math.abs(this.dy);
			if(a != 0)
			{
				this.d2x = 0
				this.dx += -0.015 * this.dx;
			}

			if(b != 0)
			{
				this.d2y = 0
				this.dy += -0.015 * this.dy;
			}

		}

	}
	
	this.getVector = function()
	{
		let arr = [];
		arr = this.matrixMultiply([0,-1], this.getDirMatrix(this.phi));
		this.d2x = 0.125*arr[0];
		this.d2y = 0.125*arr[1];
	}
	
	this.matrixMultiply = function(posArr, matrix)
    {
        let newPos = [];
        for(let i = 0; i < matrix.length; i++)
        {
            let newCord = 0;
            for(let j = 0; j< posArr.length; j++)
            {
                newCord += Math.round((posArr[j]*matrix[j][i])*1000000)/1000000;
            }
           newPos.push(newCord); 
        }
        
        return newPos;
    },
	
	this.getDirMatrix = function(angle)
    {
        let cos = Math.cos(angle * Math.PI/180);
        let sin = Math.sin(angle * Math.PI/180);
        let dirMatrix = [[],[]];
        
		dirMatrix[0][0] = Math.round(cos*1000000)/1000000;
		dirMatrix[0][1] = -Math.round(sin*1000000)/1000000;
		dirMatrix[1][0] = Math.round(sin*1000000)/1000000;
		dirMatrix[1][1] = Math.round(cos*1000000)/1000000;

        return dirMatrix;
	}	

    this.rotate = function()
    {
        let arr = [];
        for (let i = 0; i < this.sprite.length; i++)
        {
            arr.push(this.matrixMultiply(this.sprite[i], this.dirMatrix));
        }
        return arr;
    }

	this.onTouch = onTouchHandler;
}

Bullet = function(phi, posArr)
{
	this.id = "bullet_1";
	this.sprite = 
	[
		[0, -5], [-3.5, -3.5], [-5, 0], [-3.5, 3.5],
		[0, 5], [3.5, 3.5], [5, 0], [3.5, -3.5]
	];
	
	// [];

	// for (let i = 0; i<sprite4.length; i++)
	// {
	// 	let pair = [];
	// 	pair.push(sprite4[i][0]*0.35);
	// 	pair.push(sprite4[i][1]*0.35);
	// 	this.sprite.push(pair);
	// }

	this.m = 0.25 ;
	this.radius = 5;
	this.deathFlag = true;
	this.counter = 0;
	
	this.pos = [0,0,1];
	this.startPos = [0,0,1];
	
	this.pos[0] = posArr[0];
	this.pos[1] = posArr[1];
	this.startPos[0] = posArr[0];
	this.startPos[1] = posArr[1];
	
    this.newpos = [0,0,1];
    
	this.moveMatrix =
	[
        [1,0,0],
        [0,1,0],
        [0,0,1],
    ];
	    
	this.speedCoef = 15;
	this.dx = -(Math.round((Math.sin(phi * Math.PI/180))*1000000)/1000000)*this.speedCoef;
	this.dy = -(Math.round((Math.cos(phi * Math.PI/180))*1000000)/1000000)*this.speedCoef;
		
		
		
	this.matrixMultiply = function(posArr, matrix)
    {
        let newPos = [];
        for(let i = 0; i < matrix.length; i++)
        {
            let newCord = 0;
            for(let j = 0; j< posArr.length; j++)
            {
                newCord += Math.round((posArr[j]*matrix[j][i])*1000000)/1000000;
            }
           newPos.push(newCord); 
        }
        
        return newPos;
    };		
	
	this.distanceChecker = function()
	{  
		this.counter++;
		if (this.counter > 75) this.deathFlag = false;
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

let entities = [];

/*
    Принимает массив, размеры окна спрайт и число Н
    создает и добавляет в массив Н объектов астероидов в случайных
    позициях окна со случайными значениями угловых и линейных
    скоростей
*/
initAsteroids = function(entitiesArr, sprite, scrWidth, scrHeight, num)
{
    for(let i = num; i > 0; i--)
	{
        let asteroid = new Asteroid(sprite, i);
		random5values(scrWidth, scrHeight, asteroid);
		entitiesArr.push(asteroid);
	}
}
splitAsteroid = function(entitiesArr, objAs, obj)
{
	if(objAs.radius<20)return;
	let randomAngle = 22.5;
	let dirMatrix_1 = objAs.onTouch.getDirMatrix(randomAngle);
	let dirMatrix_2 = objAs.onTouch.getDirMatrix(-randomAngle);
	let newVectorRaw = [0,0];
	newVectorRaw = objAs.onTouch.getVector(objAs.m, [objAs.dx, objAs.dy],  obj.m, [obj.dx, obj.dy], objAs.newpos, obj.newpos);
	let newVector_1 = objAs.onTouch.matrixMultiplyLeft(newVectorRaw, dirMatrix_1);
	let newVector_2 = objAs.onTouch.matrixMultiplyLeft(newVectorRaw, dirMatrix_2);
	
	let fragment_1 = new Asteroid(objAs.getSmallerSprite(), 0.1);
	fragment_1.newpos[0] = objAs.newpos[0];
	fragment_1.newpos[1] = objAs.newpos[1];
	fragment_1.dx = newVectorRaw[0];								//newVector_1[0];
	fragment_1.dy = newVectorRaw[1];								//newVector_1[1];
	fragment_1.dPhi = objAs.dPhi;
	fragment_1.radius = objAs.radius/2;
	entitiesArr.push(fragment_1);
	
	let fragment_2 = new Asteroid(objAs.getSmallerSprite(), 0.1);
	fragment_2.newpos[0] = objAs.newpos[0];
	fragment_2.newpos[1] = objAs.newpos[1];
	fragment_2.dx = newVector_2[0];
	fragment_2.dy = newVector_2[1];
	fragment_2.dPhi = objAs.dPhi;
	fragment_2.radius = objAs.radius/2;
	entitiesArr.push(fragment_2);
}

initShip = function(entitiesArr, sprite, scrWidth, scrHeight)
{
	let ship = new Ship(sprite);
	ship.pos[0] = scrWidth/2;
	ship.pos[1] = scrHeight/2;
	entitiesArr.push(ship);

	document.addEventListener('keydown',behavior =  function(event){
	

		if(event.key == "ArrowLeft")
		{
			ship.dPhi = 5;
		}
		else if(event.key == "ArrowRight")
		{
			ship.dPhi = -5;
		}
		else if(event.key == "ArrowUp")
		{
			ship.flag = 1;
			ship.getVector();
		}
		else if(event.key == "ArrowDown")
		{
			console.log(`\t\tspeed_X = ${ship.dx}
			speed_Y = ${ship.dy}
			accelerate_X = ${ship.d2x}
			accelerate_Y = ${ship.d2y}`);
		}
		else if(event.key == " ")
		{
			let bullet = new Bullet(ship.phi, ship.pos);
			entities.push(bullet);
		}
	})
	document.addEventListener('keyup', function(event)
	{
		if(event.key == "ArrowLeft" || event.key == "ArrowRight")
		{
			ship.dPhi   = 0;
		}
		else if(event.key == "ArrowUp")
		{
			ship.flag = 0;
		}
	})

	return ship;
}

/*
    Принимает объект и размеры окна, инициализирует поля
    объекта случайными величинами
*/
random5values = function(scrWidth, scrHeight, object)
{
    object.pos[0] = Math.round((Math.round(Math.random()*100)/100) * scrWidth);
    object.pos[1] = Math.round((Math.round(Math.random()*100)/100) * scrHeight);
    object.dx =     (Math.random() < 0.5) ? ((Math.round(Math.random()*100)/100) * 0.9) : -((Math.round(Math.random()*100)/100) * 0.9) ;
    object.dy =     (Math.random() > 0.5) ? (0.9 - Math.abs(object.dx)): -(0.9 - Math.abs(object.dx));
    object.dPhi =   (Math.random() > 0.5) ? (Math.round(Math.random()*10)/10) : -(Math.round(Math.random()*10)/10);
};

/*
    Принимает объект и размер окна, обновляет матрицу сдвига
    объекта его значениями приращений линейных скоростей,
    обновляет его спрайт на значение приращения угла поворота
    объекта, обрабатывает столкновения с границами окна
    обновляет значение координат объекта 
*/
updateEntity = function(maxWidth, maxHeight, object)
{
	if (object.id === "ship")
	{
		object.phi += object.dPhi;
		object.dirMatrix = object.getDirMatrix(object.dPhi);
		if (object.dPhi != 0)object.sprite = object.rotate();
        object.stopChecker();
        object.dx = (Math.abs(object.dx + object.d2x) > object.maxSpeed) ? object.dx : object.dx + object.d2x;
        object.dy = (Math.abs(object.dy +  object.d2y) > object.maxSpeed)? object.dy : object.dy +  object.d2y;
        object.moveMatrix[2][0] = object.dx;
		object.moveMatrix[2][1] = object.dy;
        object.newpos = object.matrixMultiply(object.pos, object.moveMatrix);
	}
	else if (object.id === "bullet_1")
	{
		object.moveMatrix[2][0] = object.dx;
		object.moveMatrix[2][1] = object.dy;
		object.newpos = object.matrixMultiply(object.pos, object.moveMatrix);
		object.distanceChecker();
	}
	else
	{
		object.moveMatrix[2][0] = object.dx;
		object.moveMatrix[2][1] = object.dy;
		object.newpos = object.matrixMultiply(object.pos, object.moveMatrix);
		object.sprite = object.rotate(object.dPhi);
	}
	if(object.newpos[0] > maxWidth) object.newpos[0] = 5;
	if(object.newpos[1] > maxHeight) object.newpos[1] = 5;
	if(object.newpos[0] < 0) object.newpos[0] = maxWidth-5;
	if(object.newpos[1] < 0) object.newpos[1] = maxHeight-5;
}

prepareEntity = function(objects)
{
    for(let i = 0; i<objects.length; i++)
    {
        for(let j = 0; j<objects.length; j++)
        {
            if (objects[i].id == objects[j].id) continue;
            else if (objects[i].id == "ship")
            {
				if (objects[j].id == "bullet_1") continue;
				
				
                const sumOfR = objects[i].radius + objects[j].radius;
                const deltaX = Math.abs(objects[i].newpos[0] - objects[j].newpos[0]); 
                const deltaY = Math.abs(objects[i].newpos[1] - objects[j].newpos[1]);
                const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                if (distance < sumOfR)
				{
					onTouchHandler.getPrecisionPos(objects[i], objects[j]);
					// let newVector = 
					// objects[j].onTouch.getVector(objects[j].m, [objects[j].dx, objects[j].dy], objects[i].m, [objects[i].dx, objects[i].dy], objects[j].newpos, objects[i].newpos);
					// objects[j].dx = newVector[0];
					// objects[j].dy = newVector[1];
					
					splitAsteroid(objects, objects[j], objects[i]);
					
					objects[i].deathFlag = false;
					objects[j].deathFlag = false;

				}

            }
			else if (objects[i].id == "bullet_1")
            {			
				if (objects[j].id == "ship") continue;
				
                const sumOfR = objects[i].radius + objects[j].radius;
                const deltaX = Math.abs(objects[i].newpos[0] - objects[j].newpos[0]); 
                const deltaY = Math.abs(objects[i].newpos[1] - objects[j].newpos[1]);
                const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                if (distance < sumOfR)
				{
					onTouchHandler.getPrecisionPos(objects[i], objects[j]);
					// let newVector = 
					// objects[j].onTouch.getVector(objects[j].m, [objects[j].dx, objects[j].dy], objects[i].m, [objects[i].dx, objects[i].dy], objects[j].newpos, objects[i].newpos);
					// objects[j].dx = newVector[0];
					// objects[j].dy = newVector[1];
					
					splitAsteroid(objects, objects[j], objects[i]);
					objects[i].deathFlag = false;
					objects[j].deathFlag = false;
				}
            }
        }

		objects[i].pos = objects[i].newpos;
    }
}

killEntities = function(objArr)
{
	for (let i = 0; i<objArr.length; i++)
	{
		if (!objArr[i].deathFlag)
		{
			if (objArr[i].id == "ship")
			{
				delayTimer.active = true;
				delayTimer.deathCount--;
				document.removeEventListener('keydown',behavior);
			}
			objArr.splice(i, 1); 
		}
	}
	if (delayTimer.active == true) delayTimer.tick();
}

reborn = function(ship)
{
	if (delayTimer.active == true && delayTimer.count == 180 && delayTimer.deathCount > 0)
	{
		ship = initShip(entities, sprite3, canvas.width, canvas.height);

		delayTimer.active = false;
		delayTimer.count = 0;

	}
	else if (delayTimer.active == true && delayTimer.count == 180)
	{
		// console.log("GAME_OVER");
		alert("GAME_OVER");
		delayTimer.active = false;
		delayTimer.count = 0;

	}
}

/*
    ОСНОВНАЯ ФУНКЦИЯ ИГРЫ
    ВЫПОЛНЯЕТСЯ В Б. ЦИКЛЕ

    Принимает контекст холста и массив объектов
    вызывает обновление информации каждого объекта
    массива и его отрисовку на холсте с учетом
    информации для нового кадра 
*/
update = function(ctx, objects, shipPointer)
{
	for(let i = 0; i<objects.length; i++)updateEntity(canvas.width, canvas.height, objects[i]);
    prepareEntity(objects);
	killEntities(objects);
	reborn(shipPointer);

	
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    	for(let i = 0; i<objects.length; i++)
        drawFigure(ctx, objects[i]);
    ctx.stroke();
};

/*
    Принимает контекст холста и массив точек
    рисует замкнутую фигуру описанную массивом
*/
drawFigure = function(ctx, obj)
{
    ctx.moveTo(obj.pos[0],     obj.pos[1]);
    
    ctx.moveTo(shift([obj.pos[0],obj.pos[1]],obj.sprite[0])[0],   shift([obj.pos[0],obj.pos[1]],obj.sprite[0])[1]);
    
    for(let i = 1; i <= obj.sprite.length-1; i++)
    {
        ctx.lineTo(shift([obj.pos[0],obj.pos[1]],obj.sprite[i])[0],   shift([obj.pos[0],obj.pos[1]],obj.sprite[i])[1]);
    }
    ctx.lineTo(shift([obj.pos[0],obj.pos[1]],obj.sprite[0])[0],   shift([obj.pos[0],obj.pos[1]],obj.sprite[0])[1]);
};

/*
    Суммирует два массива из двух элементов
*/
shift = function(pairBase, pairShift)
{
    return [(pairBase[0] + pairShift[0]), (pairBase[1] + pairShift[1])];
};



let canvas = document.getElementById("canvasld");
let ctx = canvas.getContext("2d");
ctx.stokeStyle = "#000";
ctx.beginPath();

initAsteroids(entities, sprite1, canvas.width, canvas.height, 8);
let ship = initShip(entities, sprite3, canvas.width, canvas.height);

setInterval(()=>{
    update(ctx, entities, ship);
	
},16)
