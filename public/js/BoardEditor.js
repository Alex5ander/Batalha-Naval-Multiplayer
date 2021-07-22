class BoardEditor extends Board{
    constructor(x, y){
        super(x, y, false);
		this.lastSelectedPiece = false;
    }
    isBusy(piece, nc){
        var busy = false;
		var d = 
			(nc.x - 1 >= 0 && nc.y - 1 >= 0  && this.grid[nc.y - 1][nc.x - 1] === 1) || 
			(nc.x + piece.width <= 9 && nc.y - 1 >= 0  && this.grid[nc.y - 1][nc.x + piece.width] === 1) ||
			(nc.x + piece.width <= 9 && nc.y + piece.height <= 9  && this.grid[nc.y + piece.height][nc.x + piece.width] === 1) ||
			(nc.x - 1 >= 0 && nc.y + piece.height <= 9  && this.grid[nc.y + piece.height][nc.x - 1] === 1);
        for(var i = 0; i < piece.len; i++){
            if(piece.width > piece.height){
				var hy = (nc.y - 1 >= 0 && this.grid[nc.y - 1][nc.x + i] === 1) || (nc.y + 1 <= 9 && this.grid[nc.y + 1][nc.x + i] === 1);
				var vx = (nc.x - 1 >= 0 && this.grid[nc.y][nc.x - 1] === 1) || (nc.x + piece.width <= 9 && this.grid[nc.y][nc.x + piece.width] === 1)
                if(this.grid[nc.y][nc.x + i] !== 0 || (vx || hy || d)){
                    busy = true;
                    break;
                }
            }else{
				var hy = (nc.y - 1 >= 0 && this.grid[nc.y - 1][nc.x] === 1) || (nc.y + piece.height <= 9 && this.grid[nc.y + piece.height][nc.x] === 1);
				var vx = (nc.x - 1 >= 0 && this.grid[nc.y + i][nc.x - 1] === 1) || (nc.x + 1 <= 9 && this.grid[nc.y + i][nc.x + 1] === 1);
				if(this.grid[nc.y + i][nc.x] !== 0 || (vx || hy || d)){
					busy = true;
					break;
				}
            }
        }
        return busy;
    }
    insert(piece, nc){
        if(this.isBusy(piece, nc) === false){
            for(var y = 0; y < piece.height; y++){
				for(var x = 0; x < piece.width; x++){
					var ind = (nc.x + x) + (nc.y + y) * 10;
					this.grid[nc.y + y][nc.x + x] = 1;
					this.pieces[ind] = piece;
				}
            }
            piece.x = this.x + nc.x;
            piece.y = this.y + nc.y;
            
			this.pieces[piece.id] = piece;
			
            piece.lx = nc.x;
            piece.ly = nc.y;
			
			piece.inBoard = true;
			this.lastSelectedPiece = piece;
            return true;
        }
        return false;
    }
    move(piece, nc){
        this.remove(piece)
        if(this.insert(piece, nc)){
            return true;
        }
        return false;
    }
    remove(piece){
        if(piece.inBoard){
			for(var y = 0; y < piece.height; y++){
				for(var x = 0; x < piece.width; x++){
					var ind = (piece.lx + x) + (piece.ly + y) * 10;
					this.grid[piece.ly + y][piece.lx + x] = 0;
					delete this.pieces[ind];
				}
			}
			this.lastSelectedPiece = false;
			delete this.pieces[piece.id];
        }
        piece.inBoard = false;
    }
    rotatePieceInBoard(e){
		if(this.lastSelectedPiece){
			var piece = this.lastSelectedPiece;
			var w = piece.width;
			var h = piece.height;
			this.remove(piece);
			piece.width = h;
			piece.height = w;
			piece.x = this.x + piece.lx;
			piece.y = this.y + piece.ly;
			this.drop({subject:e.subject, piece:piece});
		}
    }
    drop(e){
        var piece = e.piece;
        var nc = {
			x:Math.floor(piece.x + .5 - this.x),
			y:Math.floor(piece.y + .5 - this.y)
		};
        var ex = nc.x + Math.floor(piece.width) - 1;
        var ey = nc.y + Math.floor(piece.height) - 1;
        if(nc.x >= 0 && nc.x <= 9 && nc.y >= 0 && nc.y <= 9 && ex >= 0 && ex <= 9 && ey >= 0 && ey <= 9){
            if(piece.inBoard){
                if(this.move(piece, nc) === false){
                    piece.x = this.x + piece.lx;
                    piece.y = this.y + piece.ly;
					var nc = {
						x:Math.floor(piece.x + .5 - this.x),
						y:Math.floor(piece.y + .5 - this.y)
					};
					this.insert(piece, nc);
                }
            }else if(!piece.inBoard){
                if(this.insert(piece, nc) === false){
                    piece.resete();
                }
            }
        }else{
            this.remove(piece);
            piece.resete();
        }
        var allInBoard = e.subject.objects.every(o => o.inBoard === true || o.inBoard === undefined)
        e.subject.notify({
            type:"allInBoard",
            allInBoard:allInBoard
        });
    }
}