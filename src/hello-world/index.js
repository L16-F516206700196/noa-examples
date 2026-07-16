

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

//perlin by FWJ7 / L16_F51620
let seedNum = 0;
let scale=16;
let heightScale=4;

const dot = (a,b) => (a[0]*b[0])+(a[1]*b[1]);
const fade = x => 6*(x**5) - 15*(x**4) + 10*(x**3);
const lerp = (a, b, n) => a + ((b - a)*n);

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

const angleGen = (x, y) => {
	let seedU = `${x},${y}|${seedNum}`;
	let angle = randomS(generateHash(seedU))*Math.PI*2;
	return [Math.cos(angle),Math.sin(angle)] //for length 1
}

const perlin = (x, y) => {
	
    let x_0 = Math.floor(x), x_1 = x_0+1, y_0 = Math.floor(y), y_1 = y_0+1; 
	const g_00=angleGen(x_0,y_0);
	const g_10=angleGen(x_1,y_0);
	const g_01=angleGen(x_0,y_1);
	const g_11=angleGen(x_1,y_1);
    let frx=x-x_0;
    let fry=y-y_0;
    let u = fade(frx), v = fade(fry); 
    let d_00 = [frx, fry], d_10 = [frx-1, fry], d_01 = [frx, fry-1], d_11 = [frx-1, fry-1]; 
    let s_00 = dot(g_00,d_00), s_10 = dot(g_10,d_10), s_01 = dot(g_01,d_01), s_11 = dot(g_11,d_11); 
    let lx0 = lerp(s_00,s_10,u), lx1 = lerp(s_01,s_11,u); 
    let value = lerp(lx0,lx1,v);
    return value;
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
var brownish = [0.45, 0.36, 0.22]
var greenish = [0.1, 0.8, 0.2]
noa.registry.registerMaterial('dirt', brownish, null);
noa.registry.registerMaterial('grass', greenish, null);
noa.registry.registerMaterial('stone', [0.5,0.5,0.5], null); //stone
noa.registry.registerMaterial('bedrock', [0.1,0.1,0.1], null); //stone
//noa.registry.registerMaterial(name, color, textureURL)

// block types and their material names
var dirtID = noa.registry.registerBlock(1, { material: 'dirt' })
var grassID = noa.registry.registerBlock(2, { material: 'grass' })
var stoneID = noa.registry.registerBlock(3, {material: 'stone'})
var bedrockID = noa.registry.registerBlock(4, {material: 'bedrock'})
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
function getVoxelID(x, y, z) {
	let k=x/scale;
	let l=z/scale;
	let height=(perlin(k,l)*(scale/heightScale))
	+(perlin(k/2,l/2)*(scale/heightScale)/2)
	+(perlin(k/4,l/4)*(scale/heightScale)/4)
	+(perlin(k/8,l/8)*(scale/heightScale)/8)
	+(perlin(k/16,l/16)*(scale/heightScale)/16);
	let amount = Math.round(height);
	if (y < -99) return 0;
	if (y === -99) return bedrockID
	if (y < amount-5) return stoneID
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
        for (var j = 0; j < data.shape[1]; j++) {
            for (var k = 0; k < data.shape[2]; k++) {
                var voxelID = getVoxelID(x + i, y + j, z + k)
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
