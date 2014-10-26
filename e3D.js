/*------------------------------------------------------
	UNITS
------------------------------------------------------*/
function rad(alpha){
	return alpha * ( Math.PI / 180 );
}

function deg(alpha){
	return alpha * ( 180 / Math.PI );
}

/*------------------------------------------------------
    ROTATION MATRICES
------------------------------------------------------*/
function xAxisRotMatrix(alpha){
	return [ 
        [1.0, 0.0, 0.0],
        [0.0, Math.cos(alpha), -Math.sin(alpha)],
        [0.0, Math.sin(alpha), Math.cos(alpha)]		
    ];
}

function yAxisRotMatrix(alpha){    
    return [ 
        [Math.cos(alpha), 0.0, Math.sin(alpha)],
        [0.0, 1.0, 0.0],
        [-Math.sin(alpha), 0.0, Math.cos(alpha)]		
    ];
}

function zAxisRotMatrix(alpha){
	return [ 
        [Math.cos(alpha), Math.sin(alpha), 0.0],
        [-Math.sin(alpha), Math.cos(alpha), 0.0],
        [0.0, 0.0, 1.0]		
    ];		
}

function computeMatrixTransform(matrix, vertex){
	// vector * matrix product
	return new Vertex(
        (matrix[0][0] * vertex.x) + 
        (matrix[0][1] * vertex.y) +
        (matrix[0][2] * vertex.z),
        (matrix[1][0] * vertex.x) + 
        (matrix[1][1] * vertex.y) +
        (matrix[1][2] * vertex.z),
        (matrix[2][0] * vertex.x) + 
        (matrix[2][1] * vertex.y) +
        (matrix[2][2] * vertex.z)
    )
}

function vectorDistance3D(v0, v1){
    return Math.sqrt(
        Math.pow(v1.x - v0.x, 2) +
        Math.pow(v1.y - v0.y, 2) +
        Math.pow(v1.z - v0.z, 2)
    );
}

/*----------------------------------------------------------------------
    CONSTANTS
----------------------------------------------------------------------*/
var MOD_POINT		= 0;
var MOD_LINE		= 1;
var MOD_LINE_STRIP	= 2;
var MOD_LINE_LOOP	= 3;
var MOD_POLYGON		= 4;
var MOD_QUAD		= 5;
var MOD_QUAD_STRIP	= 6;
var MOD_TRIAD		= 7;
var MOD_TRIAD_STRIP	= 8;
var MOD_TRIAD_FAN	= 9;

/*----------------------------------------------------------------------
    BASIC DATA STRUCTURES
----------------------------------------------------------------------*/
function Vertex(x, y, z){
	this.x = x || 0.0;
	this.y = y || 0.0;
	this.z = z || 0.0;
}

function MapVertex(x, y, z, h){
    this.x = x || 0.0;
	this.y = y || 0.0;
	this.z = z || 0.0;
    this.h = h || 0.0;
}

function VertexList(vx, mode){
	this.vx		= vx	|| new Array();
	this.mode	= mode	|| MOD_POINT; 
}

function VertexListT(vx, list, mode){
	this.vx		        = vx	|| new Array();
	this.list	        = list	|| new Array();
	this.mode	        = mode	|| MOD_POINT;
    this.pushVx         = function(vx){
        this.vx.push(vx);
        return this.vx.length - 1;
    },
	this.pushPolygons	= function(polygons){
        for(p in polygons){
            this.list.push(polygons[p]);
        }
	}
}

/*----------------------------------------------------------------------
    GLOBALS
----------------------------------------------------------------------*/
var g;

var BUFFER = new Array();

var SigmaAngle = {
    x: 0.0,
	y: 0.0,
	z: 0.0
}

// Screen
var SCR = {w: 500, h: 500};

// ORIGIN
var origin = new Vertex(SCR.w / 2, SCR.h / 2, 0.0);	

/*----------------------------------------------------------------------
    CAMERA
----------------------------------------------------------------------*/	
function Camera(x, y, z, hFOV, vFOV){

	this.x = x || 0.0;
	this.y = y || 0.0;
	this.z = z || 0.0;	
	
	this.setFOV = function(h, v){
		return {
			h: rad(h) || rad(45),
			v: rad(v) || rad(45)	
		}
	}
	
	this.setViewDistance = function(){	
		// Set up the view distance based on the field-of-view (with pythagoras)
		return {
			h: SCR.w / Math.tan( this.FOV.h / 2 ),
			v: SCR.h / Math.tan( this.FOV.v / 2 )
		}
	}
	
	this.proj = function(x, y, z){
		return {
			x: (((x + this.x) * this.vD.h) / (z + this.z + origin.z)) + origin.x,
			y: (((y + this.y) * this.vD.v) / (z + this.z + origin.z)) + origin.y
		}
	}
	
	// set initial values	
	this.FOV	= this.setFOV(hFOV, vFOV);
	this.vD		= this.setViewDistance();
};

function Viewport(ctx, cameras){
    
	this.g			= ctx.getContext('2d');
    this.id         = ctx.id;
    this.campntr	= 0;
    this.camlist    = new Array();
    this.addcam     = function(cam){
        this.camlist.push(cam);
    }

    // add cameras on construct
    if(cameras === undefined)
        this.addcam(new Camera(0.0, 0.0, -10.0));
    else {
        for(i in cameras)
            this.addcam(cameras[i]);
    }        	
    	
	this.nextcam	= function(){
		if((this.campntr += 1) == this.camlist.length)
			this.campntr = 0;	
	}
	this.prevcam	= function(){
		if((this.campntr -= 1) < 0)
			this.campntr = (this.camlist.length - 1);	
	}
	this.actvcam	= function(){ 
		return this.camlist[this.campntr];
	}
    	this.transforms	= new Vertex();
	this.buffer		= new Array();

    ctx.onclick = function(){
        console.log('Switching view... ' + this.id);
        CTRL.setview(this.id);    
    };
}

/*------------------------------------------------------
    RENDER
------------------------------------------------------*/
function render(ctx, buffer, camera){

	if(ctx === undefined) throw('Undefined graphic context');
	
	ctx.clearRect( 0 , 0 , SCR.w , SCR.h );
	ctx.strokeStyle	= 'lime'; 
		
	for(vxl in buffer){
	
		switch(buffer[vxl].mode){
			case(MOD_POINT):
				
				ctx.fillStyle		= 'red'; //'rgb(255, 255, 255)';
				
				for(i in buffer[vxl]){	
				
					var vx = buffer[vxl][i];
						
					for(s = 0; s < vx.length; s++){	
                            
                        //if(vx[s] === undefined || vx[s+1] === undefined || vx[s+2] === undefined)
                        //    continue;
    
						
						//if(vx[s].z < 0 || vx[s+1].z < 0 || vx[s+2].z < 0)
						//	continue;
							
						var v0 = camera.proj(vx[s].x,	vx[s].y,	vx[s].z);
						
						if(vx[s+1] !== undefined)
							var v1 = camera.proj(vx[s+1].x,	vx[s+1].y,	vx[s+1].z);
						
						if(vx[s+2] !== undefined)
							var v2 = camera.proj(vx[s+2].x,	vx[s+2].y,	vx[s+2].z);
							
						ctx.beginPath();	
						
						ctx.arc(v0.x, v0.y, 2, 0, 2 * Math.PI);
						
						ctx.fill();
					}
					
				}
				
				break;
			case(MOD_LINE):
				break;				
			case(MOD_LINE_STRIP):
				break;				
			case(MOD_LINE_LOOP):
				break;				
			case(MOD_POLYGON):
				break;				
			case(MOD_QUAD):
				break;				
            case(MOD_QUAD_STRIP):
			
				//ctx.fillStyle = 'olive';
			
				var vx		= buffer[vxl].vx;
				var list	= buffer[vxl].list;
				
				for(i in list){

                    if(vx[list[i][0]].z < 0 /* || vx[list[i][1]].z < 0 ||  vx[list[i][2]].z < 0 ||  vx[list[i][3]].z < 0 */)
					   continue;

				
					var v0 = camera.proj(vx[list[i][0]].x,	vx[list[i][0]].y,	vx[list[i][0]].z);
					
					//if(vx[s+1] !== undefined)
					var v1 = camera.proj(vx[list[i][1]].x,	vx[list[i][1]].y,	vx[list[i][1]].z);
					
					//if(vx[s+2] !== undefined)
					var v2 = camera.proj(vx[list[i][2]].x,	vx[list[i][2]].y,	vx[list[i][2]].z);	

                    //if(vx[s+3] !== undefined)
					var v3 = camera.proj(vx[list[i][3]].x,	vx[list[i][3]].y,	vx[list[i][3]].z);
						
					ctx.beginPath();	
					
					ctx.moveTo(v0.x, v0.y);
					ctx.lineTo(v1.x, v1.y);
					ctx.lineTo(v2.x, v2.y);
					ctx.lineTo(v3.x, v3.y);	
                       
					
					ctx.closePath();
					ctx.stroke();
					//ctx.fill();
				}
				
                break;				
			case(MOD_TRIAD):
				break;				
			case(MOD_TRIAD_STRIP):
			
				for(i in buffer[vxl]){	
	
					var vx = buffer[vxl][i];
						
					for(s = 0; s < vx.length; s++){	

                        if(vx[s] === undefined || vx[s+1] === undefined || vx[s+2] === undefined)
                           continue;
						
						if(vx[s].z < 0 || vx[s+1].z < 0 || vx[s+2].z < 0)
							continue;
							
						var v0 = camera.proj(vx[s].x,	vx[s].y,	vx[s].z);
						
						if(vx[s+1] !== undefined)
							var v1 = camera.proj(vx[s+1].x,	vx[s+1].y,	vx[s+1].z);
						
						if(vx[s+2] !== undefined)
							var v2 = camera.proj(vx[s+2].x,	vx[s+2].y,	vx[s+2].z);						
							
						ctx.beginPath();	
						
						ctx.moveTo(v0.x, v0.y);
						ctx.lineTo(v1.x, v1.y);
						ctx.lineTo(v2.x, v2.y);						
						
						ctx.closePath();
						ctx.stroke();						
					}					
				}
			
				break;			
			case(MOD_TRIAD_FAN):
				break;	
			default:
				throw('Unknown draw mode.');
				break;
		}
	}	
	//Debug.update(ctx);
}


function applyTransforms(obj){
	
	SigmaAngle.x += Transforms.x;
    SigmaAngle.y += Transforms.y;
    SigmaAngle.z += Transforms.z;
    
    sf = new Array();

    for(var s = 0; s < obj.vertices.length; s++) {
			
		modelTransX = computeMatrixTransform( xAxisRotMatrix( rad(SigmaAngle.x) ), obj.vertices[s] );
		modelTransXY = computeMatrixTransform( yAxisRotMatrix( rad(SigmaAngle.y ) ), modelTransX );
		modelTransXYZ = computeMatrixTransform( zAxisRotMatrix( rad(SigmaAngle.z ) ), modelTransXY );
		
        sf.push(modelTransXYZ);
    }
	
    return sf;
}

function transformVertex(v){

	SigmaAngle.x = CTRL.currview().transforms.x;
    SigmaAngle.y = CTRL.currview().transforms.y;
    SigmaAngle.z = CTRL.currview().transforms.z;
	   
	modelTransX = computeMatrixTransform( xAxisRotMatrix( rad(SigmaAngle.x) ), v );
	modelTransXY = computeMatrixTransform( yAxisRotMatrix( rad(SigmaAngle.y ) ), modelTransX );
	return modelTransXYZ = computeMatrixTransform( zAxisRotMatrix( rad(SigmaAngle.z ) ), modelTransXY );

}

function modelToVertexList(vertices, triangles, mod){
	var vl = new Array();
    mod = (mod === undefined) ? MOD_TRIAD_STRIP : mod;
	
	for(t in triangles){
		var vx = new Array();
		
		for(v in triangles[t])	
			vx.push(vertices[triangles[t][v]]);
			
		vl.push( new VertexList(vx, mod) );
	}
	
	return vl;
}

function Obj3D(model){
	this.model				= model || new Array();
	this.transforms 		= new Vertex(0.0, 0.0, 0.0);
	this.applyTransforms	= function(){
			
		SigmaAngle.x = CTRL.currview().transforms.x;
		SigmaAngle.y = CTRL.currview().transforms.y;
		SigmaAngle.z = CTRL.currview().transforms.z;
	
		for(vl in this.model)
			for(vx in this.model[vl].vx){				   
				modelTransX = computeMatrixTransform( xAxisRotMatrix( rad(SigmaAngle.x) ), this.model[vl].vx[vx] );
				modelTransXY = computeMatrixTransform( yAxisRotMatrix( rad(SigmaAngle.y ) ), modelTransX );
				this.model[vl].vx[vx] = computeMatrixTransform( zAxisRotMatrix( rad(SigmaAngle.z ) ), modelTransXY );
			}
	}
}
