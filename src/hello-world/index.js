

/* 
 * 
 *          noa hello-world example
 * 
 *  This is a bare-minimum example world, intended to be a 
 *  starting point for hacking on noa game world content.
 * 
*/



// Engine options object, and engine instantiation:
import { Engine } from 'noa-engine'

// or import from local filesystem when hacking locally:
// import { Engine } from '../../../noa'


var opts = {
    debug: true,
    showFPS: true,
    chunkSize: 32,
    chunkAddDistance: 2.5,
    chunkRemoveDistance: 3.5,
	texturePath:"textures/",
    // See `test` example, or noa docs/source, for more options
}
var noa = new Engine(opts)
var permutationTable=[];
for(let i=0;i<256;i++){permutationTable.push(i)}
//perlin by FWJ7 / L16_F51620, normalisation for angleGen3 by GPT 5.4 nano (idk trig lol)
let seedNum = 0;
let scale=16;
let heightScale=4;
const SQRT_HALF=0.70710678118654752;
const gradientTable=[
	[1,0,],
	[-1,0,],
	[0,1],
	[0,-1],
	[SQRT_HALF,SQRT_HALF,],
	[-SQRT_HALF,SQRT_HALF,],
	[SQRT_HALF,-SQRT_HALF,],
	[-SQRT_HALF,-SQRT_HALF,],

];
const gradientTable3=[
	[SQRT_HALF,SQRT_HALF,0],
	[-SQRT_HALF,SQRT_HALF,0],
	[SQRT_HALF,-SQRT_HALF,0],
	[-SQRT_HALF,-SQRT_HALF,0],

	[0,SQRT_HALF,SQRT_HALF,],
	[0,-SQRT_HALF,SQRT_HALF,],
	[0,SQRT_HALF,-SQRT_HALF,],
	[0,-SQRT_HALF,-SQRT_HALF,],

	[SQRT_HALF,0,SQRT_HALF,],
	[SQRT_HALF,0,-SQRT_HALF,],
	[-SQRT_HALF,0,SQRT_HALF,],
	[-SQRT_HALF,0,-SQRT_HALF,],
];
let caveThreshold = 0.77, leniency = 0.066;
const dot = (a,b0,b1) => (a[0]*b0)+(a[1]*b1);
const dot3 = (a,b0,b1,b2) => (a[0]*b0)+(a[1]*b1)+(a[2]*b2);
const fade = x => 6*(x**5) - 15*(x**4) + 10*(x**3);
const lerp = (a, b, n) => a + ((b - a)*n);
const smoothstep=(a,b,n)=>{
	let t = Math.max(0,Math.min(1,(n-a)/(b-a)));
	return 6*(t**5) - 15*(t**4) + 10*(t**3);
}
const rgba_hex=rgba=>{
	let hex="#";
    for(i of rgba.map(i=>Math.floor(i))){
    	let checkedV=i.toString(16);
        if(checkedV.length<2)checkedV=`0${checkedV}`;
        hex=`${hex}${checkedV}`;
    }
    return hex;
}

const generateHash=str=>{
    let hash=2166136261;
    for(let i=0;i<str.length;i++){
        hash^=(str[i].charCodeAt());
        hash = Math.imul(hash,16777619);
    }
    
    return hash;
}

const randomS=s=>{
	s^=(s<<13);
	s^=(s>>>7);
    s^=(s<<17); 
	return ((s>>>0)/4294967295)
}

for(let i=256;i>0;i--){
	let j = randomS(generateHash(`${seedNum}|${i}`))*i;
	[permutationTable[i],permutationTable[j]]=[permutationTable[j],permutationTable[i]];
}


const angleGen = (x, y) => {
	let hash=generateHash(`${x},${y}|${seedNum}`);
	return gradientTable[hash & 7];
}

const angleGen3 = (x, y, z) => {
	let hash=generateHash(`${x},${y},${z}|${seedNum}`);
	return gradientTable[hash % 12];
}

const perlin = (x, y) => {
	
    let x_0 = Math.floor(x), x_1 = x_0+1, y_0 = Math.floor(y), y_1 = y_0+1; 
    let frx=x-x_0;
    let fry=y-y_0;
    let u = fade(frx), v = fade(fry); 
    let s_00 = dot(angleGen(x_0,y_0),frx, fry), s_10 = dot(angleGen(x_1,y_0),frx-1, fry);
	let s_01 = dot(angleGen(x_0,y_1),frx, fry-1), s_11 = dot(angleGen(x_1,y_1),frx-1, fry-1); 
    let lx0 = lerp(s_00,s_10,u), lx1 = lerp(s_01,s_11,u); 
    let value = lerp(lx0,lx1,v);
    return value;
}

const perlin3 = (x, y, z) => {
	
    let x_0 = Math.floor(x), x_1 = x_0+1, y_0 = Math.floor(y), y_1 = y_0+1, z_0 = Math.floor(z), z_1 = z_0+1; 
    let frx=x-x_0;
    let fry=y-y_0;
	let frz=z-z_0;
    let u = fade(frx), v = fade(fry), w = fade(frz);
    let s_000 = dot3(angleGen3(x_0,y_0,z_0),frx, fry, frz), s_100 = dot3(angleGen3(x_1,y_0,z_0),frx-1, fry, frz);
	let s_010 = dot3(angleGen3(x_0,y_1,z_0),frx, fry-1, frz), s_110 = dot3(angleGen3(x_1,y_1,z_0),frx-1, fry-1, frz); 
	let s_001 = dot3(angleGen3(x_0,y_0,z_1),frx, fry, frz-1), s_101 = dot3(angleGen3(x_1,y_0,z_1),frx-1, fry, frz-1);
	let s_011 = dot3(angleGen3(x_0,y_1,z_1),frx, fry-1, frz-1), s_111 = dot3(angleGen3(x_1,y_1,z_1),frx-1, fry-1, frz-1); 
    let lx0 = lerp(s_000,s_100,u), lx1 = lerp(s_010,s_110,u); 
	let lx2 = lerp(s_001,s_101,u), lx3 = lerp(s_011,s_111,u); 
	let ly0 = lerp(lx0,lx1,v), ly1 = lerp(lx2,lx3,v);
    let value = lerp(ly0,ly1,w);
    return value;
}
//perlin frequencies here may look off because normally you should multiply x/16,y/16 by a higher number. However, k and l, which are used, are actually x/scale and z/scale, so it's the opposite here. Sorry for the strange behaviour lol
const evalPerlinWithFBM=(x,y,z)=>{
	let k=x/scale,l=y/scale,m=z/scale;
	return (perlin3(k/16,l/24,m/16)*(scale/heightScale)/16)
	+(perlin3(k/ 8,l/ 12,m/ 8)*(scale/heightScale)/8)
	+(perlin3(k/ 3,l/ 4.5,m/ 3)*(scale/heightScale)/4)
	+(perlin3(k/ 1,l/ 1.5,m/ 1)*(scale/heightScale)/8)
	//four octaves for now because five is super expensive.
}
const shouldBeCaveAir = (x, y, z) => {
	const sx=1,sy=1,sz=1;
	let cV=evalPerlinWithFBM(x*sx,y*sy,z*sz);
	cV+=9/8
	cV/=9/4;
	const t=smoothstep(caveThreshold-leniency,caveThreshold+leniency,cV)
	return t>0.67;
}

/*
 *
 *      Registering voxel types
 * 
 *  Two step process. First you register a material, specifying the 
 *  color/texture/etc. of a given block face, then you register a 
 *  block, which specifies the materials for a given block type.
 * 
*/

// block materials (just colors for this demo)
var brownish = [0.45, 0.36, 0.22, 0.5]
var greenish = [0.1, 0.8, 0.2, 0.6]
noa.registry.registerMaterial('dirt', {color:brownish});
noa.registry.registerMaterial('grass', {color:greenish});
noa.registry.registerMaterial('stone', {color:[0.5,0.5,0.5,0.5]}); //stone
noa.registry.registerMaterial('depthstone', {color:[0.3,0.3,0.3,0.5]}); //darker stone
noa.registry.registerMaterial('bedrock', {color:[0.1,0.1,0.1],});
//noa.registry.registerMaterial(name, color, textureURL)

// block types and their material names
var dirtID = noa.registry.registerBlock(1, {material: 'dirt'})
var grassID = noa.registry.registerBlock(2, {material: 'grass'})
var stoneID = noa.registry.registerBlock(3, {material: 'stone'})
var depthstoneID = noa.registry.registerBlock(4, {material: 'depthstone'})
var bedrockID = noa.registry.registerBlock(5, {material: 'bedrock'})
//noa.registry.registerMaterial(blockID, opts)



/*
 * 
 *      World generation
 * 
 *  The world is divided into chunks, and `noa` will emit an 
 *  `worldDataNeeded` event for each chunk of data it needs.
 *  The game client should catch this, and call 
 *  `noa.world.setChunkData` whenever the world data is ready.
 *  (The latter can be done asynchronously.)
 * 
*/

// simple height map worldgen function
function getVoxelID(x, y, z,height) {
	
	let amount = Math.round(height);
	if (y < -256) return 0;
	if (y === -256) return bedrockID
	if(shouldBeCaveAir(x,y,z)&&y<amount)return 0;
	if (y < amount-128)return depthstoneID
	if (y < amount-5)return stoneID
    if (y < amount-1) return dirtID
    
    if (y < amount) return grassID
    return 0 // signifying empty space
}

// register for world events
noa.world.on('worldDataNeeded', function (id, data, x, y, z) {
    // `id` - a unique string id for the chunk
    // `data` - an `ndarray` of voxel ID data (see: https://github.com/scijs/ndarray)
    // `x, y, z` - world coords of the corner of the chunk
    for (var i = 0; i < data.shape[0]; i++) {
        for (var k = 0; k < data.shape[2]; k++) {
			let l=x/scale;
			let m=z/scale;
			let height=(perlin(l,m)*(scale/heightScale))
			+(perlin(l/2,m/2)*(scale/heightScale)/2)
			+(perlin(l/4,m/4)*(scale/heightScale)/4)
			+(perlin(l/8,m/8)*(scale/heightScale)/8)
			+(perlin(l/16,m/16)*(scale/heightScale)/16);
            for (var j = 0; j < data.shape[1]; j++) {
                var voxelID = getVoxelID(x + i, y + j, z + k,height);
                data.set(i, j, k, voxelID)
            }
        }
    }
    // tell noa the chunk's terrain data is now set
    noa.world.setChunkData(id, data)
})




/*
 * 
 *      Create a mesh to represent the player:
 * 
*/

// get the player entity's ID and other info (position, size, ..)
var player = noa.playerEntity
var dat = noa.entities.getPositionData(player)
var w = dat.width
var h = dat.height
var move = noa.entities.getMovement(player)

move.maxSpeed = 7.2;move.jumpImpulse=(84/11);move.moveForce = 60;move.jumpTime=0;move._jumpCount=1;
// add a mesh to represent the player, and scale it, etc.
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import '@babylonjs/core/Meshes/Builders/boxBuilder'

var scene = noa.rendering.getScene()
var mesh = Mesh.CreateBox('player-mesh', 1, scene)
mesh.scaling.x = w
mesh.scaling.z = w
mesh.scaling.y = h


// add "mesh" component to the player entity
// this causes the mesh to move around in sync with the player entity
noa.entities.addComponent(player, noa.entities.names.mesh, {
    mesh: mesh,
    // offset vector is needed because noa positions are always the 
    // bottom-center of the entity, and Babylon's CreateBox gives a 
    // mesh registered at the center of the box
    offset: [0, h / 2, 0],
})



/*
 * 
 *      Minimal interactivity 
 * 
*/

// clear targeted block on on left click
noa.inputs.down.on('fire', function () {
    if (noa.targetedBlock) {
        var pos = noa.targetedBlock.position
        noa.setBlock(0, pos[0], pos[1], pos[2])
    }
})

// place some grass on right click
noa.inputs.down.on('alt-fire', function () {
    if (noa.targetedBlock) {
        var pos = noa.targetedBlock.adjacent
        noa.setBlock(grassID, pos[0], pos[1], pos[2])
    }
})

// add a key binding for "E" to do the same as alt-fire
noa.inputs.bind('alt-fire', 'E')


// each tick, consume any scroll events and use them to zoom camera
noa.on('tick', function (dt) {
    var scroll = noa.inputs.state.scrolly
    if (scroll !== 0) {
        noa.camera.zoomDistance += (scroll > 0) ? 1 : -1
        if (noa.camera.zoomDistance < 0) noa.camera.zoomDistance = 0
        if (noa.camera.zoomDistance > 10) noa.camera.zoomDistance = 10
    }
})
 
