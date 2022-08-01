import * as THREE from 'three';
import { PointerLockControls } from 'PointerLockControls';
import * as CANNON from './cannon-es.js'

var groundMesh, groundBody;
const container = document.getElementById( 'container' );


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var controls = new PointerLockControls( camera, document.body );
 document.addEventListener( 'click', _ => {
    if(!controls.isLocked && player.firstTimeClicking === true){controls.lock(),createAudio(), player.firstTimeClicking=false}
    else if(!controls.isLocked && parameters.visible === false){controls.lock()}
});  
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio)
container.appendChild( renderer.domElement );

var player = {
forward: false,
left: false,
right: false,
back: false,
shift: false,
speed: 0.2,
can_move: true,
height: 3,
IsClicking: false,
firstTimeClicking: true,
ctrl: false,
PassTuto: false
}
var parameters = {
    soundVolume: .5,
    element: document.getElementById('parameters'),
    visible: false,
    volumeRange: document.getElementById('volume'),
    sensiblityRange: document.getElementById('sensiblity')
}
camera.position.y = player.height
camera.position.z = 20

var allMesh = [], allBodies = []
const TimeStep = 1/60

var grab = {
    dist: 2,
    cwd1: new THREE.Vector3(),
    cwd2: new THREE.Vector3(),
    target: undefined,
    vectornull: new CANNON.Vec3(0, 0 ,0),
    actual_dist: 1 //la distance entre le kapla etet le cube
}


        
var woodTexture, tuto, add;
      
var loadTextures= _=>{
    const loader = new THREE.TextureLoader();
    woodTexture = loader.load('assets/wood.jpg');
    woodTexture.magFilter = THREE.LinearFilter;//3498DB 

    tuto = loader.load('assets/tuto.jpg');

    scene.background = new THREE.Color(0x3498DB )
}
loadTextures()
//delplacement
var move =_=>{
if(player.can_move){
  if(player.forward){controls.moveForward(player.speed)}else if(player.back){controls.moveForward(-player.speed)} 
  if(player.left){controls.moveRight(-player.speed)} else if(player.right){controls.moveRight(player.speed)}
}
}
  const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
  })

var createGround =_=>{
  const groundGeo = new THREE.PlaneGeometry(30, 30)
  const groundMat = new THREE.MeshBasicMaterial({
      color: 0x21618C,
      side: THREE.DoubleSide,
      //wireframe: true
  })
  groundMesh = new THREE.Mesh(groundGeo, groundMat)
  scene.add(groundMesh)

  groundBody = new CANNON.Body({
              shape: new CANNON.Plane(),
              type: CANNON.Body.STATIC
          })
          world.addBody(groundBody)
          groundBody.quaternion.setFromEuler(-Math.PI/2, 0,0)
  groundMesh.position.copy(groundBody.position)
  groundMesh.quaternion.copy(groundBody.quaternion)
}

var actualise_physic =_=>{
  world.step(TimeStep)
  for(let i=0; i< allBodies.length; i++){
      allMesh[i].position.copy(allBodies[i].position)
      allMesh[i].quaternion.copy(allBodies[i].quaternion)
  }
}



var addTile =(x, y, z, width, height, depth)=>{
  const BoxGeometry = new THREE.BoxGeometry(width, height, depth)
  const BoxMaterial = new THREE.MeshBasicMaterial({
      //color: 0x00ff00,
      map: woodTexture
      //wireframe: true
  })
  const box = new THREE.Mesh(BoxGeometry, BoxMaterial)
  
  allMesh.push(box)
  allMesh[allMesh.length-1].allMeshIndex = allMesh.length-1
  scene.add(allMesh[allMesh.length-1])
  const boxBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2)), //<== radius du carré
      position: new CANNON.Vec3(x, y, z),
      angularVelocity: new CANNON.Vec3(1, 0, 1)
  })
  allBodies.push(boxBody)
  world.addBody(allBodies[allBodies.length-1])
  
}
/////////////////////////////////////////////////////////////////

        
        function updatePositionForCamera() {
    // fixed distance from camera to the object
        var dist = grab.dist;
        var cwd = grab.cwd1;
        
        camera.getWorldDirection(cwd);
        
        cwd.multiplyScalar(dist);
        cwd.add(camera.position);
        
        grab.cwd2.set(cwd.x, cwd.y, cwd.z)
       // cube3.position.set(cwd.x, cwd.y, cwd.z);
        //cube3.setRotationFromQuaternion(camera.quaternion);
    }

  ////////////////////////////////////////////////////////////////////


    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function onPointerMove( event ) {
        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        pointer.x = (  window.innerWidth/2 / window.innerWidth ) * 2 - 1;
        pointer.y = - ( window.innerHeight/2  / window.innerHeight ) * 2 + 1;
    }
    function selectTile(){
        if(grab.target != undefined)return
        raycaster.setFromCamera( pointer, camera );
        // calculate objects intersecting the picking ray   
        allMesh.forEach(e => {
            e.material.color.set(0xffffff);
        });
        const intersects = raycaster.intersectObjects( allMesh );
         //   for ( let i = 0; i < intersects.length; i ++ ) {
            if(intersects.length===0)return
            var i = 0
               intersects[ i ].object.material.color.set( 0xff0000 );
                if(!player.IsClicking){
                    //console.log("lol")
                    grab.dist = intersects[i].distance
                    
                }else if(grab.dist< 10){ 
                 grab.target = intersects[i].object
                 grab.actual_dist = intersects[i].distance
                // console.log("grab") 
                const body = allBodies[intersects[i].object.allMeshIndex]

                }
    }
    
    var moveTile = (tileX, tileY, tileZ, tileBody) =>{
        
        var tilevelocity = dist(grab.cwd2.x, grab.cwd2.y, grab.cwd2.z, tileX, tileY, tileZ)
       // console.log(dist(grab.cwd2.x, grab.cwd2.y, grab.cwd2.z, tileX, tileY, tileZ))
       
        tileBody.angularVelocity.x = 0
        tileBody.angularVelocity.y = 0
        tileBody.angularVelocity.z = 0 
      //  if(dist(grab.cwd2.x, grab.cwd2.y, grab.cwd2.z, tileX, tileY, tileZ) < 0.2)return
         if(tileX < grab.cwd2.x){tileBody.velocity.x =tilevelocity}
        else if(tileX > grab.cwd2.x){tileBody.velocity.x =-tilevelocity}
        if(tileY < grab.cwd2.y){tileBody.velocity.y =tilevelocity}
        else if(tileY > grab.cwd2.y){tileBody.velocity.y=-tilevelocity}
        if(tileZ < grab.cwd2.z){tileBody.velocity.z =tilevelocity}
        else if(tileZ > grab.cwd2.z){tileBody.velocity.z=-tilevelocity} 
    }
    window.addEventListener( 'pointermove', onPointerMove );

    var dist =(x1, y1, z1, x2, y2, z2)=>Math.sqrt((x2-x1)**2+ (y2-y1)**2+ (z2-z1)**2)
    
    var createTuto = () =>{

    var material = new THREE.MeshBasicMaterial({color: 0x287BB2});
    var box = new THREE.Mesh(
    new THREE.BoxGeometry(10, 13, 1),
    [
        material,
        material,
        material,
        material,
        new THREE.MeshBasicMaterial( { map: tuto } ),
        material
    ]
);

        box.position.set(0, 10, -25)
        scene.add(box)

    }

  ////////////////////////////////////////////////////////////////////
  var listener, sound;
function createAudio(){
  listener = new THREE.AudioListener();
  camera.add( listener );

  // create a global audio source
  sound = new THREE.Audio( listener );

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load( 'assets/audio.mp3', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( true );
    sound.setVolume(  parameters.soundVolume  );
    sound.play()
});

} 
  ////////////////////////////////////////////////////////////////////

document.addEventListener('keydown', (e)=>{
    if(e.key==='p' || e.key==='P'){
        if(parameters.visible === false){
            parameters.element.style.visibility = 'visible'
            parameters.visible = true
            controls.unlock()
           
        }else{
            parameters.element.style.visibility = 'hidden'
            parameters.visible = false
            sound.setVolume(  parameters.volumeRange.value );
            controls.pointerSpeed = parameters.sensiblityRange.value
            controls.lock()
        }
    }
})

 /////////////////////////////////////////////////////////////////////
  createGround()
  createTuto()
  actualise_physic()
 // addTile(0, 10, 0, 1.17, .08, .23)
 // addTile(5, 15, 0, 1.17, .08, .23)

function animate() {
    //console.log(grab.targetPosition)
    //console.log(player.IsClicking)
    requestAnimationFrame( animate );
    move()
    actualise_physic()
    selectTile()
    updatePositionForCamera()
    if(player.IsClicking && grab.target!= undefined     ){
        const i = allBodies[grab.target.allMeshIndex] 
        moveTile(i.position.x, i.position.y, i.position.z, i)
    }
    
    renderer.render( scene, camera );
}


document.addEventListener('mousedown', _=>{
    player.IsClicking = true
})          //a finir
document.addEventListener('mouseup', _=>{
    player.IsClicking = false
    if(grab.target == undefined) return
       allBodies[grab.target.allMeshIndex].velocity.x = 0
    allBodies[grab.target.allMeshIndex].velocity.z = 0   
    

    grab.target=undefined
})
addEventListener('wheel', e => {
    if(grab.target==undefined)return
    const i = allBodies[grab.target.allMeshIndex]
   // console.log(i)
    if(e.deltaY > 0 && player.shift){i.quaternion.x+=0.1}
    else if(e.deltaY < 0 && player.shift){i.quaternion.x-=0.1}
    else if(e.deltaY > 0){i.quaternion.y+=0.1}//quand on scroll vers le bas
    else if(e.deltaY < 0){i.quaternion.y-=0.1}//quand on scroll vers le haut
    
    
});
document.addEventListener('keydown', (event)=>{
//   console.log(event.keyCode)
 // if(event.key == "Shift"){player.shift = true}

  switch (event.keyCode){
              case 90:
                  player.forward = true
                  break;
              case 81:
                  player.left = true
                  break;
              case 68:
                  player.right = true
                  break;
              case 83:
                  player.back = true
                  break;
              case 16:
                  player.shift = true
                  break;
              case 84:
                if(!player.PassTuto){
                    document.getElementById('tuto').style.visibility = 'hidden'
                }
                addTile(0, 10, -10, 1.17, .08, .23)
                break;
              case 17:
                if(!player.ctrl){player.ctrl=true, player.speed=0.05}else{player.ctrl=false, player.speed=0.2}
                break;
              case 18:
                if(controls.isLocked){controls.unlock()}else{controls.lock()}
                break;
          
      }
    
})
document.addEventListener('keyup', (event)=>{
  switch (event.keyCode){
              case 90:
                  player.forward = false
                  break;
              case 81:
                  player.left = false
                  break;
              case 68:
                  player.right = false
                  break;
              case 83:
                  player.back = false
                  break;
              case 16:
                  player.shift = false
                  break;
          
      }
})       

  window.addEventListener('resize', _=>{
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
  }) 
  animate();