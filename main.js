let screenCanvas, info;
let run = true;
let fps = 1000 / 30;
let mouse = new Point();
let ctx;
let fire = false;
let counter = 0;
let score = 0;
let message = '';
let radian = new Array();

let CHARA_COLOR = 'rgba(255, 0, 0, 1)';
let CHARA_SHOT_COLOR = 'rgba(255, 105, 180, 1)';
let CHARA_SHOT_MAX_COUNT = 10;
let ENEMY_COLOR = 'rgba(255, 255, 255, 0.75)';
let ENEMY_MAX_COUNT = 10;
let ENEMY_SHOT_COLOR = 'rgba(255, 255, 255, 1)';
let ENEMY_SHOT_MAX_COUNT = 150;
let BOSS_COLOR = 'rgba(0, 0, 255, 1)';
let BOSS_BIT_COLOR = 'rgba(0, 255, 255, 0.75)';
let BOSS_BIT_COUNT = 5;

// - main ---------------------------------------------------------------------
window.onload = function(){
	let i, j, k, l;
	let p = new Point();
	let q = new Point();
	let enemySize = 0;
	
	screenCanvas = document.getElementById('screen');
	screenCanvas.width = 500;
	screenCanvas.height = 500;
	
	mouse.x = screenCanvas.width / 2;
	mouse.y = screenCanvas.height - 20;
	
	ctx = screenCanvas.getContext('2d');
	
	screenCanvas.addEventListener('mousemove', mouseMove, true);
	screenCanvas.addEventListener('mousedown', mouseDown, true);
	window.addEventListener('keydown', keyDown, true);
	
	info = document.getElementById('info');
	
	for(i = 0; i < 360; i++){
		radian[i] = i * Math.PI / 180;
	}
	
	var chara = new Character();
	chara.init(10);
	
	var charaShot = new Array(CHARA_SHOT_MAX_COUNT);
	for(i = 0; i < CHARA_SHOT_MAX_COUNT; i++){
		charaShot[i] = new CharacterShot();
	}
	
	var enemy = new Array(ENEMY_MAX_COUNT);
	for(i = 0; i < ENEMY_MAX_COUNT; i++){
		enemy[i] = new Enemy();
	}
	
	var enemyShot = new Array(ENEMY_SHOT_MAX_COUNT);
	for(i = 0; i < ENEMY_SHOT_MAX_COUNT; i++){
		enemyShot[i] = new EnemyShot();
	}
	
	var boss = new Boss();
	
	(function(){
		counter++;
		
		ctx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
		
		// 自機 ---------------------------------------------------------------
		ctx.beginPath();
		
    //bg
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

		chara.position.x = mouse.x;
		chara.position.y = mouse.y;
		
		ctx.arc(
			chara.position.x,
			chara.position.y,
			chara.size,
			0, Math.PI * 2, false
		);
		
		ctx.fillStyle = CHARA_COLOR;
		
		ctx.fill();
		
		if(fire){
			for(i = 0; i < CHARA_SHOT_MAX_COUNT; i++){
				if(!charaShot[i].alive){
					charaShot[i].set(chara.position, 3, 6);
					break;
				}
			}
			fire = false;
		}
		
		// 自機ショット -------------------------------------------------------
		ctx.beginPath();
		
		for(i = 0; i < CHARA_SHOT_MAX_COUNT; i++){
			if(charaShot[i].alive){
				charaShot[i].move();
				
				ctx.arc(
					charaShot[i].position.x,
					charaShot[i].position.y,
					charaShot[i].size,
					0, Math.PI * 2, false
				);
				
				ctx.closePath();
			}
		}
		
		ctx.fillStyle = CHARA_SHOT_COLOR;
		
		ctx.fill();
		
		// エネミーの出現管理 -------------------------------------------------
		if(counter < 1400){
			switch(true){
				case counter < 600:
					if(counter % 100 === 0){
						for(i = 0; i < ENEMY_MAX_COUNT; i++){
							if(!enemy[i].alive){
								j = (counter % 200) / 100;
								
								enemySize = 15;
								p.x = -enemySize + (screenCanvas.width + enemySize * 2) * j
								p.y = screenCanvas.height / 2;
								
								enemy[i].set(p, enemySize, j);
								
								break;
							}
						}
					}
					break;
				// カウンタが1300まではタイプ2とタイプ3の敵を出現させる
				case counter < 1300:
					if(counter % 50 === 0){
						if(counter % 200 < 100){
							for(i = 0; i < ENEMY_MAX_COUNT; i++){
								if(!enemy[i].alive){
									enemySize = 15;
									if(counter % 400 < 200){
										j = 2;
										p.x = screenCanvas.width / 3;
										p.y = -enemySize;
									}else{
										j = 3;
										p.x = screenCanvas.width - screenCanvas.width / 3;
										p.y = -enemySize;
									}
									
									enemy[i].set(p, enemySize, j);
									
									break;
								}
							}
						}
					}
					break;
			}
		}else if(counter === 1400){
			// 1400 フレーム目にボスを出現させる
			p.x = screenCanvas.width / 2;
			p.y = -80;
			boss.set(p, 50, 30);
			
    }
		
		switch(true){
			case counter < 70:
				message = 'READY...';
				break;
			
			case counter < 100:
				message = 'GO!!';
				break;
			
			default:
				message = '';
				
				// エネミー ---------------------------------------------------
				ctx.beginPath();
				
				for(i = 0; i < ENEMY_MAX_COUNT; i++){
					if(enemy[i].alive){
						enemy[i].move();
						
						ctx.arc(
							enemy[i].position.x,
							enemy[i].position.y,
							enemy[i].size,
							0, Math.PI * 2, false
						);
						
						if(enemy[i].param % 15 === 0){
							for(j = 0; j < ENEMY_SHOT_MAX_COUNT; j++){
								if(!enemyShot[j].alive){
									p = enemy[i].position.distance(chara.position);
									p.normalize();
									enemyShot[j].set(enemy[i].position, p, 5, 6);
									
									break;
								}
							}
						}
						
						ctx.closePath();
					}
				}
				
				ctx.fillStyle = ENEMY_COLOR;
				
				ctx.fill();
				
				// エネミーショット -------------------------------------------
				ctx.beginPath();
				
				for(i = 0; i < ENEMY_SHOT_MAX_COUNT; i++){
					if(enemyShot[i].alive){
						enemyShot[i].move();
						
						ctx.arc(
							enemyShot[i].position.x,
							enemyShot[i].position.y,
							enemyShot[i].size,
							0, Math.PI * 2, false
						);
						
						ctx.closePath();
					}
				}
				
				ctx.fillStyle = ENEMY_SHOT_COLOR;
				
				ctx.fill();
				
				// ボス -------------------------------------------------------
				ctx.beginPath();
				
				if(boss.alive){
					boss.move();
					
					ctx.arc(
						boss.position.x,
						boss.position.y,
						boss.size,
						0, Math.PI * 2, false
					);
					
					// ボスからショットを撃つ
					if(boss.param > 100){
						i = boss.param % 150;
						if(i >= 120){
							if(i % 10 === 0){
								p = boss.position.distance(chara.position);
								p.normalize();
								k = 0;
								for(j = 0; j < ENEMY_SHOT_MAX_COUNT; j++){
									if(!enemyShot[j].alive){
										q.x = p.x;
										q.y = p.y;
										l = (360 + (k - 2) * 20) % 360;
										q.rotate(radian[l]);
										enemyShot[j].set(boss.position, q, 7, 3);
										k++;
										if(k > 4){break;}
									}
								}
							}
						}
					}
					
					// パスをいったん閉じる
					ctx.closePath();
				}
				
				// ボスの色を設定する
				ctx.fillStyle = BOSS_COLOR;
				
				// ボスを描く
				ctx.fill();
				
							
				// 衝突判定 ---------------------------------------------------
				for(i = 0; i < CHARA_SHOT_MAX_COUNT; i++){
					if(charaShot[i].alive){
						for(j = 0; j < ENEMY_MAX_COUNT; j++){
							if(enemy[j].alive){
								p = enemy[j].position.distance(charaShot[i].position);
								if(p.length() < enemy[j].size){
									enemy[j].alive = false;
									charaShot[i].alive = false;
									
									score++;
									
									break;
								}
							}
						}
						
												
            if(boss.alive){
							p = boss.position.distance(charaShot[i].position);
							if(p.length() < boss.size){
								boss.life--;
								
								charaShot[i].alive = false;
								
								if(boss.life < 0){
									score += 10;
									run = false;
									message = 'CLEAR !!';
								}
							}
						}
					}
				}
				
				for(i = 0; i < ENEMY_SHOT_MAX_COUNT; i++){
					if(enemyShot[i].alive){
						p = chara.position.distance(enemyShot[i].position);
						if(p.length() < chara.size){
							chara.alive = false;
							
							run = false;
							message = 'GAME OVER !!';
							break;
						}
					}
				}
				break;
		}
		
		// HTMLを更新
		info.innerHTML = 'SCORE: ' + (score * 100) + ' ' + message;
		
		// フラグにより再帰呼び出し
		if(run){setTimeout(arguments.callee, fps);}
	})();
};


// - event --------------------------------------------------------------------
function mouseMove(event){
	// マウスカーソル座標の更新
	mouse.x = event.clientX - screenCanvas.offsetLeft;
	mouse.y = event.clientY - screenCanvas.offsetTop;
}

function mouseDown(event){
	// フラグを立てる
	fire = true;
}

function keyDown(event){
	// キーコードを取得
	var ck = event.keyCode;
	
	// Escキーが押されていたらフラグを降ろす
	if(ck === 27){run = false;}
}


