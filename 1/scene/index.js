var TILE_WIDTH = 60;
var TILE_HEIGHT = 60;
var MAX_LEVEL = 3;

var g_cameraX = 0;
var g_cameraY = 0;

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();

var g_objList = new ObjManager(); 
var g_imgs = [];

var g_turnStart = false;

var g_targetX;
var g_targetY;


var SceneIngame = function() { 

	this.LoadStage = function(idx) {
		this.state = 'game';
	
		g_objList.Clear();
		console.log('start!');
		Renderer.defaultColor = "#000"; 
	}

	this.LoadImg = function(name, img, width, height) {
		g_imgs[name] = {};
		g_imgs[name].img = ImageManager.Register( "assets/"+img, name);
		g_imgs[name].width = width;
		g_imgs[name].height = height;

		return g_imgs[name];
	}

	this.Start = function() { 
		this.LoadImg('bg', 'bg.png',  320, 500); 
		this.LoadImg('player', 'player.png',  128, 128); 

		this.LoadImg('mon_1', '01001.png', 128, 128);
		this.LoadImg('mon_2', '01003.png', 128, 128);
		this.LoadImg('mon_3', '01005.png', 128, 128);
		this.LoadImg('mon_4', '01006.png', 128, 128);
		this.LoadImg('mon_5', '01007.png', 128, 128);

		this.LoadImg('sword_effect', 'sword_effect.png', 60, 60);

		this.LoadImg('hp', 'heart.gif', 50, 50);

		this.LoadImg('coin', 'gold.png', 64, 64);


		this.LoadImg('dust', 'dust.png', 208, 208);
		this.LoadImg('meteo', 'meteo.png', 128, 128);
		this.LoadImg('warn', 'ability_08.png', 128, 128); 
		this.LoadImg('redline', 'redline.png', 1, 500); 

		this.LoadImg('merchant', 'merchant.png', 128, 128);
		this.LoadImg('turret', 'turret.png', 60, 60);
		this.LoadImg('turret_fire', 'turret_fire.png', 320, 6);

		this.LoadImg('item_turret', 'item_turret.png', 60, 60);


		var width = parseInt(Renderer.width / TILE_WIDTH);
		var height  = parseInt(Renderer.height / TILE_HEIGHT);

		for(var i = 0; i < width; ++i)
			for(var j = 0; j < height; ++j) {
				if(j == 3 || j == 4)
					continue;
				mon = g_objList.Add(TILE_WIDTH * i, TILE_HEIGHT * j, "mon_1"); 

				if(j < width / 2)
					mon.enemy = true;
				else
					mon.enemy = false;
			}

//		mon = g_objList.Add(TILE_WIDTH * 3, TILE_HEIGHT * 3, "mon_1"); 
//		mon = g_objList.Add(TILE_WIDTH * 5 , TILE_HEIGHT * 3, "mon_1"); 
	}

	this.End = function() {
	} 

	this.UpdateGames = function() {
		if(this.state == 'gameOver')
			return;

		g_objList.Update(); 
	}

	this.GenerateUnit= function() {
		return;
		var col = parseInt(Renderer.width / TILE_WIDTH);
		var row = parseInt(Renderer.height / TILE_HEIGHT);

		var x = randomRange(0, col - 1) * TILE_WIDTH;
		var y = randomRange(0, row - 1) * TILE_HEIGHT;
		var list = g_objList.GetChrByPos(x, y);
		if(list.length == 0)
			mon = g_objList.Add(x, y, "mon_1"); 
	}
	
	this.Update = function()
	{ 
		this.UpdateGames();

//		g_stageTimeLeft = g_stageTimeMax - (g_now - g_stageTime) / 1000;
//		if(this.state != 'gameOver') {
//			this.state = "gameOver";
//			var user = prompt("이름을 입력 해 주세요", "AAA");
//
//			var scene = this;
//			if(user != null) {
//				ajaxReq("r.php", { height : g_height, score : g_score, gold : g_coin, player : user }, function() {
//					scene.getScores();
//				});
//			}
//			else
//				scene.getScores();
//		}
//

		if(g_turnStart) {
			var list = g_objList.GetMoveObj();

			if(list.length == 0) {
				g_turnStart = false;

				var list = g_objList.GetChrByPos(g_targetX, g_targetY);
				if(list.length > 1) {
					var mon_map = [];

					var max_idx = 0;
					var level_up = false;

					var playerHP = 0;
					var enemyHP = 0;
					for(var j in list) {
						var obj = list[j];

						obj.isDead = true; 

						if(obj.enemy)
							enemyHP += obj.level;
						else
							playerHP += obj.level;

					} 

					var d = enemyHP - playerHP;

					if(d > 0) {
						var level = Math.min(MAX_LEVEL, d);
						mon = g_objList.Add(g_targetX, g_targetY, "mon_" + level); 
						mon.scale = 2.0; 
						mon.enemy = true;
					}
					else if(d < 0) {
						var level = Math.min(MAX_LEVEL, Math.abs(d));
						mon = g_objList.Add(g_targetX, g_targetY, "mon_" + level); 
						mon.scale = 2.0; 
						mon.enemy = false;
					}

//					if(level_up) {
//						max_idx = Math.min(5, max_idx + 1); 
//						mon = g_objList.Add(g_targetX, g_targetY, "mon_" + max_idx); 
//						mon.scale = 2.0; 
//					}
//					else {
//						mon = g_objList.Add(g_targetX, g_targetY, "mon_" + max_idx); 
//					}
				}
				this.GenerateUnit();
			} 
		}

		if(MouseManager.Clicked) {
			var x = parseInt(MouseManager.x / TILE_WIDTH) * TILE_WIDTH;
			var y = parseInt(MouseManager.y / TILE_HEIGHT) * TILE_HEIGHT;

			if(x + TILE_WIDTH < Renderer.width && y + TILE_HEIGHT < Renderer.height) {
				g_targetX = x;
				g_targetY = y; 
				
				var table = [[ -TILE_WIDTH, 0], [ TILE_WIDTH, 0], 
							[0, TILE_HEIGHT], [ 0, -TILE_HEIGHT]];

				var mon_map = {};
				var target_list = [];
				for(var i in table) {
					var pos = table[i];

					var list = g_objList.GetChrByPos( x + pos[0], y + pos[1]);
					target_list = target_list.concat(list); 
				} 

				var playerCnt = 0;
				var enemyCnt = 0;
				for(var i in target_list) {
					var obj = target_list[i];

					if( obj.enemy)
						enemyCnt++;
					else
						playerCnt++; 
				}

				if(target_list.length > 0)
					g_turnStart = true;

				if(playerCnt > 0) {
					for(var j in target_list) {
						target_list[j].tx = x;
						target_list[j].ty = y;

						var type = target_list[j].type;
						if(mon_map.hasOwnProperty(type))
							mon_map[type]++;
						else
							mon_map[type] = 1;
					}
					for(var i in g_objList.m_list) {
						var item = g_objList.m_list[i];
					}
				} 
			}
		}
		g_gameUI.Update();
		g_effectManager.Update(); 
	}

	this.getScores = function() {
		ajaxReq("get_scores.php", function(list) {
			g_score_list = list; 
			console.log(list);
		}); 
	}

	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#000");
		Renderer.Rect(0,0,Renderer.width, Renderer.height);
		
		var bg = g_imgs['bg'];
		Renderer.Img(0,bg.height - g_cameraY, bg.img);

		g_objList.Render(); 
		g_effectManager.Render(); 

		Renderer.SetAlpha(1.0); 
		Renderer.SetFont('8pt Arial'); 
		Renderer.SetColor("#555");
		Renderer.Text(0, 0, "sdflkjasdfl");

		for(var i = 0; i < Renderer.width ; i += TILE_WIDTH) 
			Renderer.Rect(i, 0, 1, Renderer.height);

		for(var j = 0; j < Renderer.height ; j += TILE_HEIGHT) 
			Renderer.Rect(0, j, Renderer.width, 1);


		if(this.state == "gameOver") {
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor("#000");
			Renderer.Rect(0,0,Renderer.width, Renderer.height);
			Renderer.SetFont('15pt Arial'); 
			Renderer.SetColor("#fff");
			Renderer.Text(130,20,"게임 오버!");
			Renderer.Text(40,50,"플레이 해주셔서 감사합니다!");
			Renderer.Text(20,100  , "순위");
			Renderer.Text(80,100  , "점수");
			Renderer.Text(140,100 , "높이");
			Renderer.Text(200,100 , "이름");
			for(var i in g_score_list) {
				var item = g_score_list[i];
				var curLine = 100 + (parseInt(i)+1) * 30;
				Renderer.Text(20, curLine, parseInt(i)+1);
				Renderer.Text(80, curLine, item.score);
				Renderer.Text(140, curLine, item.height);
				Renderer.Text(200, curLine, item.player);
			}
		} else {
		} 
	} 
};
