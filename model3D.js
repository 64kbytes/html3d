function cube(){

	vl = new Array();

	var cube_vertices = new Array(
		new MapVertex(-1.0, -1.0,   1.0),
		new MapVertex(1.0,  -1.0,   1.0),
		new MapVertex(1.0,  1.0,    1.0),
		new MapVertex(-1.0, 1.0,    1.0),
		new MapVertex(-1.0, -1.0,   -1.0),
		new MapVertex(1.0,  -1.0,   -1.0),
		new MapVertex(1.0,  1.0,    -1.0),
		new MapVertex(-1.0, 1.0,    -1.0)
	);

	var cube_rectangles = new Array(    
		[0, 1, 2, 3],   // top
		[4, 5, 6, 7],   // bottom
		[0, 4, 5, 1],   // rear
		[3, 7, 6, 2],   // front
		[2, 6, 5, 1],   // left
		[3, 7, 4, 0]    // right
	);
	
	vList = new VertexListT(cube_vertices, cube_rectangles, MOD_QUAD_STRIP);
		
	var dh = .15;	
	vList = fractalSquareWTerrain(vList, dh);	
    dh = dh / 2.2; //G.H;
	vList = fractalSquareWTerrain(vList, dh);
	dh = dh / 2.2; //G.H;
	vList = fractalSquareWTerrain(vList, dh);
	dh = dh / 2.2; //G.H;
	vList = fractalSquareWTerrain(vList, dh);

	vl.push(vList);
	
	return vl;
}

function quadSphere(){
	return normalizeVertexWTerrain(cube());
}

/*
function drawCube(){

	var cube_vertices = new Array(
		new Vertex(-1.0, -1.0, 1.0),
		new Vertex(1.0, -1.0, 1.0),
		new Vertex(1.0, 1.0, 1.0),
		new Vertex(-1.0, 1.0, 1.0),
		new Vertex(-1.0, -1.0, -1.0),
		new Vertex(1.0, -1.0, -1.0),
		new Vertex(1.0, 1.0, -1.0),
		new Vertex(-1.0, 1.0, -1.0)
	);

	var cube_rectangles = new Array(    
		[0, 1, 2, 3],   // top
		[4, 5, 6, 7],   // bottom
		[0, 4, 5, 1],   // rear
		[3, 7, 6, 2],   // front
		[2, 6, 5, 1],   // left
		[3, 7, 4, 0]    // right
	);
	
	vList = modelToVertexList(cube_vertices, cube_rectangles, MOD_QUAD_STRIP);
	
	
	for(i = 0; i < 4; i++)
		vList = fractalSquare(vList);
		
		
    vList = normalizeVertex(vList);

	BUFFER = vList;
	

}
*/

/*----------------------------------------------------------------------
	AZIMUTHAL SPHERE
----------------------------------------------------------------------*/
function azimuthalSphere(){   
	
    var hour = (360 / 24);
	var lapse = 1;
	
	vl	= new Array();
	
	// latitude
    for(f = 0; f < 360; f += (hour * lapse) ){     

		vx	= new Array();
		
		// latitude
        for(q = 0; q < 180; q += (hour * lapse)){
		
            nf = rad(f);
            nq = rad(q);			
            nhour =  rad(hour * lapse);
			
			// NW
			var v0 = new Vertex(
				(Math.sin(nq) * Math.cos(nf)),
				(Math.sin(nq) * Math.sin(nf)), 
				(Math.cos(nq))
			);	
			
			// SW
			var v1 = new Vertex(
				(Math.sin(nq + nhour) * Math.cos(nf)),
				(Math.sin(nq + nhour) * Math.sin(nf)),
				(Math.cos(nq + nhour))
			);	

			// NE
			var v2 = new Vertex(
				(Math.sin(nq) * Math.cos(nf + nhour)),
				(Math.sin(nq) * Math.sin(nf + nhour)),
				(Math.cos(nq))
			);			

			// SE
			var v3 = new Vertex(
				(Math.sin(nq + nhour) * Math.cos(nf + nhour)),
				(Math.sin(nq + nhour) * Math.sin(nf + nhour)),
				(Math.cos(nq + nhour))
			);				

			vx.push(v0, v1, v2, v3);
        } 
		
		vl.push(new VertexList(vx, MOD_TRIAD_STRIP));			
    }	
	
	return vl;	
}

/*----------------------------------------------------------------------
	OCTAHEDRON
----------------------------------------------------------------------*/	
function octahedron(){

	var vertices = new Array( 
		new Vertex( 1.0, 0.0, 0.0),  
		new Vertex(-1.0, 0.0, 0.0),  
		new Vertex( 0.0, 1.0, 0.0),  
		new Vertex( 0.0,-1.0, 0.0),  
		new Vertex( 0.0, 0.0, 1.0),  
		new Vertex( 0.0, 0.0,-1.0) 
	);
	
	var triangles = new Array(
		[ 0, 4, 2 ],
		[ 2, 4, 1 ],
		[ 1, 4, 3 ],
		[ 3, 4, 0 ],
		[ 0, 2, 5 ],
		[ 2, 1, 5 ],
		[ 1, 3, 5 ],
		[ 3, 0, 5 ]
	)
	
	var vList = modelToVertexList(vertices, triangles);
	
	
	
	for(i = 0; i < 4; i++){
		vList = fractalTriangles(vList);
    }
	
	return vList;

    
}

function triadSphere(){
	return normalizeVertex(octahedron());
}


function normalizeVertex(vxl){

    var length = 1;

    for(i in vxl){
        for(n in vxl[i].vx){   

            vx =  vxl[i].vx[n];

            dv = new Vertex(vx.x, vx.y, vx.z);
                       
            m = vectorDistance3D(new Vertex(0, 0, 0), vx);  
                        
            vxl[i].vx[n].x = dv.x * (length / m);
            vxl[i].vx[n].y = dv.y * (length / m);
            vxl[i].vx[n].z = dv.z * (length / m);            
        
        }
        
    }
    return vxl;
}

function normalizeVertexWTerrain(vxList){


    for(n in vxList.vx){   
         
        vx =  vxList.vx[n];
          
		//var length = 1;
        var length = 1 + vx.h;
		
        dv = new MapVertex(vx.x, vx.y, vx.z, vx.h);
                       
        m = vectorDistance3D(new Vertex(0, 0, 0), vx);  
                       
        vxList.vx[n].x = dv.x * (length / m);
        vxList.vx[n].y = dv.y * (length / m);
        vxList.vx[n].z = dv.z * (length / m);            
        
    }
        
    
    return vxList;
}

function fractalSquareWTerrain(vxList, dh){
		
	vx		= vxList.vx;
	list	= vxList.list; 
	//out		= new VertexListT([], [], MOD_QUAD_STRIP);
	
	vxList.list = new Array();
	
	/*
        vA    v0    vB
        +-----+-----+
        |           | 
        |           |
     v3 +     + pC  + v1
        |           |
        |           |
     vD +-----+-----+ vC
              v2
	*/
	
	for(i in list){		
		
		ovA     = list[i][0]; //out.pushVx(vA);
        ovB     = list[i][1];//out.pushVx(vB);
        ovC     = list[i][2];//out.pushVx(vC);
        ovD     = list[i][3];//out.pushVx(vD);
		
		vA = vx[ovA];
		vB = vx[ovB];
		vC = vx[ovC];
        vD = vx[ovD];
        
		vAB = new MapVertex( 
			(vA.x + vB.x) / 2, 
			(vA.y + vB.y) / 2, 
			(vA.z + vB.z) / 2, 0
			//(vA.h + vB.h) / 2 + Math.random() * (dh - (dh/2)) 
		);
		vBC = new MapVertex( 
			(vB.x + vC.x) / 2, 
			(vB.y + vC.y) / 2, 
			(vB.z + vC.z) / 2, 0
			//(vB.h + vC.h) / 2 + Math.random() * (dh - (dh/2)) 
		);
		vCD = new MapVertex( 
			(vC.x + vD.x) / 2, 
			(vC.y + vD.y) / 2, 
			(vC.z + vD.z) / 2, 0
			//(vC.h + vD.h) / 2 + Math.random() * (dh - (dh/2)) 
		);
		vDA = new MapVertex( 
			(vD.x + vA.x) / 2, 
			(vD.y + vA.y) / 2, 
			(vD.z + vA.z) / 2, 0
			//(vD.h + vA.h) / 2 + Math.random() * (dh - (dh/2)) 
		);            
            
        pC = new MapVertex( 
			(vBC.x + vDA.x) / 2, 
			(vBC.y + vDA.y) / 2, 
			(vBC.z + vDA.z) / 2, 0
			//(vA.h + vB.h + vC.h + vD.h) / 4 + Math.random() * (dh - (dh/2)) 
		); 		
		
        ovAB    = vxList.pushVx(vAB);
        ovBC    = vxList.pushVx(vBC);
        ovCD    = vxList.pushVx(vCD);
        ovDA    = vxList.pushVx(vDA);
        opC     = vxList.pushVx(pC);

        vxList.pushPolygons(new Array(
            [ovA,   ovAB,   opC,    ovDA],
            [ovAB,  ovB,    ovBC,   opC],
            [opC,   ovBC,   ovC,    ovCD],
            [ovDA,  opC,    ovCD,   ovD]
        ));		
	}
	
	return vxList;
}

function fractalSquare(vList){
	
	var out = new Array();
	
	for(vl in vList){
	
		var nList = new Array();
	
		for(vx in vList[vl] ){
				
			vA = vList[vl][vx][0];
			vB = vList[vl][vx][1];
			vC = vList[vl][vx][2];
            vD = vList[vl][vx][3];
           		
			if(vD === undefined)
		    	continue;

            /*
                vA    v0    vB
                +-----+-----+
                |           | 
                |           |
             v3 +     + pC  + v1
                |           |
                |           |
             vD +-----+-----+ vC
                      v2
            */
		 
			v0 = new Vertex( (vA.x + vB.x) / 2, (vA.y + vB.y) / 2, (vA.z + vB.z) / 2 );
			v1 = new Vertex( (vB.x + vC.x) / 2, (vB.y + vC.y) / 2, (vB.z + vC.z) / 2 );
			v2 = new Vertex( (vC.x + vD.x) / 2, (vC.y + vD.y) / 2, (vC.z + vD.z) / 2 );
			v3 = new Vertex( (vD.x + vA.x) / 2, (vD.y + vA.y) / 2, (vD.z + vA.z) / 2 );            
            
            pC = new Vertex( (v1.x + v3.x) / 2, (v1.y + v3.y) / 2, (v1.z + v3.z) / 2) ; 
			
			v4 = vA;
			v5 = v0;
			v6 = pC;
			v7 = v3;

			v8 = v0;
			v9 = vB;
			v10 = v1;
			v11 = pC;

            v12 = pC;
            v13 = v1;
            v14 = vC;
            v15 = v2;

            v16 = v3;
            v17 = pC;
            v18 = v2;
            v19 = vD;

			
			out.push(
				//new VertexList(new Array(v0, v1, v2, v3), MOD_QUAD_STRIP),
				new VertexList(new Array(v4, v5, v6, v7), MOD_QUAD_STRIP),
				new VertexList(new Array(v8, v9, v10, v11), MOD_QUAD_STRIP),
				new VertexList(new Array(v12, v13, v14, v15), MOD_QUAD_STRIP),
                new VertexList(new Array(v16, v17, v18, v19), MOD_QUAD_STRIP)
        	);
		}		 
	}
	
	return out;
}


function fractalTriangles(vList){
	
	var out = new Array();
	
	for(vl in vList){
	
		var nList = new Array();
	
		for(vx in vList[vl] ){
				
			vA = vList[vl][vx][0];
			vB = vList[vl][vx][1];
			vC = vList[vl][vx][2];
			
			if(vC === undefined)
				continue;
				
			v0 = new Vertex( (vB.x + vA.x) / 2, (vB.y + vA.y) / 2, (vB.z + vA.z) / 2 );
			v1 = new Vertex( (vC.x + vB.x) / 2, (vC.y + vB.y) / 2, (vC.z + vB.z) / 2 );
			v2 = new Vertex( (vA.x + vC.x) / 2, (vA.y + vC.y) / 2, (vA.z + vC.z) / 2 );
			
			v3 = v0;
			v4 = vB;
			v5 = v1;
			
			v6 = v2;
			v7 = v1;
			v8 = vC;
			
			v9 = vA;
			v10 = v0;
			v11 = v2;		
			
			out.push(
				new VertexList(new Array(v0, v1, v2), MOD_TRIAD_STRIP),
				new VertexList(new Array(v3, v4, v5), MOD_TRIAD_STRIP),
				new VertexList(new Array(v6, v7, v8), MOD_TRIAD_STRIP),
				new VertexList(new Array(v9, v10, v11), MOD_TRIAD_STRIP)
			);
		}		 
	}
	
	return out;
}

G = {
    W_map:      513,
    H_map:      513,
    tilesize:   1,
    H:          2.1
}

