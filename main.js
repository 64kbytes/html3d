var Camera; 

var CTRL = {
    viewlist:   new Array(),
    indx:       {},
    pntr:       0,
    init:       function(){

        var views = new Array(      
            new Viewport(
                document.getElementById('cnv-NW'),
                new Array(
                    new Camera(0.0, 0.0, -10),
                    new Camera(-1.0, -1.0, -5)
                )
            ),
            new Viewport(
                document.getElementById('cnv-NE'),
                new Array(
                    new Camera(0.0, 0.0, -10),
                    new Camera(-1.0, -1.0, -5)
                )
            ),
            new Viewport(
                document.getElementById('cnv-SW'),
                new Array(
                    new Camera(0.0, 0.0, -10),
                    new Camera(-1.0, -1.0, -5)
                )
            ),
            new Viewport(
                document.getElementById('cnv-SE'),
                new Array(
                    new Camera(0.0, 0.0, -10),
                    new Camera(-1.0, -1.0, -5)
                )
            )
        );
        
        CTRL.addviews(views);
        
        KeyboardController({
            // MODEL ROTATION
            81:     function(){ CTRL.currview().transforms.z += 0.2 },  // Q
            69:     function(){ CTRL.currview().transforms.z -= 0.2 },  // E
            
            65:     function(){ CTRL.currview().transforms.y += 0.2 },  // W
            68:     function(){ CTRL.currview().transforms.y -= 0.2 },  // S

            87:     function(){ CTRL.currview().transforms.x -= 0.2 },  // A
            83:     function(){ CTRL.currview().transforms.x += 0.2 },  // D

            // CAMERA CONTROLS
            37:     function(){ CTRL.currview().actvcam().x += 0.025; },    // left
            38:     function(){ CTRL.currview().actvcam().y += 0.025; },    // up
            39:     function(){ CTRL.currview().actvcam().x -= 0.025; },    // right
            40:     function(){ CTRL.currview().actvcam().y -= 0.025; },    // down
            
            88:     function(){ CTRL.currview().actvcam().z -= 0.05; },     // zoom in 
            90:     function(){ CTRL.currview().actvcam().z += 0.05; },     // zoom out
            
            67:     function(){ console.log('Next camera.'); CTRL.currview().nextcam(); },      // C
            86:     function(){ console.log('Previous camera.'); CTRL.currview().prevcam(); },  // V
            // RESET TRANSFORMATIONS
            32:     function(){
                CTRL.currview().transforms.x = 0;
                CTRL.currview().transforms.y = 0;
                CTRL.currview().transforms.z = 0;
            }
        }, {81: 1, 69: 1, 87: 1, 83: 1, 65:1, 68:1, 37:1, 38:1, 39:1, 40:1, 32:0,  109:1,  107:1, 88: 1, 90: 1, 67: 0, 86: 0}, function(){});
            
        var sphere      = new Obj3D(azimuthalSphere());
        var octhed      = new Obj3D(octahedron());
        var tSphere     = new Obj3D(triadSphere());
        var cubeOb      = new Obj3D(cube());
        var qSphere     = new Obj3D(quadSphere());
        

        CTRL.viewlist[0].buffer.push(tSphere);
        CTRL.viewlist[1].buffer.push(cubeOb);
        CTRL.viewlist[2].buffer.push(sphere);
        CTRL.viewlist[3].buffer.push(octhed);
        //CTRL.viewlist[3].buffer.push(qSphere);
        
                
        loop(); 
    },
    setview:    function(id){
        CTRL.pntr = CTRL.indx[id];
    },
    currview:   function(){
        return CTRL.viewlist[CTRL.pntr];
    },
    addview:    function(view){
        CTRL.indx[view.id] = CTRL.viewlist.length;
        CTRL.viewlist.push(view);
    },
    addviews:   function(views){
        for(v in views)
            CTRL.addview(views[v]);
    }
}

function loop(){

    // apply transforms
    for(vl in CTRL.currview().buffer)               
        CTRL.currview().buffer[vl].applyTransforms();
    
    for(vp in CTRL.viewlist){
               
        /*
        // apply camera transforms
        for(vl in CTRL.viewlist[vp].buffer)             
            CTRL.viewlist[vp].buffer[vl].applyTransforms();
        */  
        
        // render viewports
        for(ob in CTRL.viewlist[vp].buffer){        
            render(
                CTRL.viewlist[vp].g, 
                CTRL.viewlist[vp].buffer[ob].model, 
                CTRL.viewlist[vp].actvcam()
            );

            Debug.update(CTRL.viewlist[vp]);
        }
    }
    
    setTimeout(function(){loop()}, 1000/60);
}

window.onload = function(){         
    
        
    Debug = {
        update: function(vp){

            ctx = vp.g;
            cam = vp.actvcam();
            vtr = vp.transforms;

            ctx.fillStyle   = 'white';
            ctx.font        = 'normal .8em Monospace';
            ctx.fillText('Viewing cam: ' + vp.campntr, 0, 400);
            ctx.fillText('Coords:  ' + 'X: ' + cam.x + ' Y: ' + cam.y + ' Z: ' + cam.z, 0, 425);
            ctx.fillText('FOV: ' + 'H: ' + cam.FOV.h + ' V: ' + cam.FOV.v, 0, 450);
            ctx.fillText('Transforms: ' + 'X: ' + vtr.x + ' Y: ' + vtr.y + ' Z: ' + vtr.z, 0, 475);         
            
        }
    }

    CTRL.init();
    
    
};
