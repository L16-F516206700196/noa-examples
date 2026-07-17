import{E as Engine}from"./index.2b3d1184.js";import{C as D}from"./babylon.39bd9ef3.js";var opts={debug:!0,showFPS:!0,chunkSize:32,chunkAddDistance:2.5,chunkRemoveDistance:3.5,texturePath:"textures/"},noa=new Engine(opts),e=noa;
let seedNum = 0;
let scale=16;
let heightScale=4;
let caveThreshold = 0.77, leniency = 0.066;

const dot = (a,b) => (a[0]*b[0])+(a[1]*b[1]);
const dot3 = (a,b) => (a[0]*b[0])+(a[1]*b[1])+(a[2]*b[2]);
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
//limit or cache per chunk later.
let cacheAG=new Map();
let cacheAG3=new Map();

const angleGen = (x, y) => {
	let keyCheck=`${x},${y}`;
	if(cacheAG.has(keyCheck))return cacheAG.get(keyCheck);
	let seedU = `${x},${y}|${seedNum}`;
	let angle = randomS(generateHash(seedU))*Math.PI*2;
	let rV=[Math.cos(angle),Math.sin(angle)];
	cacheAG.set(keyCheck,rV);
	return rV //for length 1
}

const angleGen3 = (x, y, z) => {
	let keyCheck=`${x},${y},${z}`;
	if(cacheAG3.has(keyCheck))return cacheAG3.get(keyCheck);
	let seedU = `${x},${y},${z}|${seedNum}`;
	let r1 = randomS(generateHash(`${seedU}|a`));
	let r2 = randomS(generateHash(`${seedU}|b`));

	//ty for the normalisation chatgpt
	const theta = r1 * Math.PI * 2;           // 0..2pi
	const phi = Math.acos(1 - 2 * r2);       // 0..pi (gives uniform-ish directions)

	const sinPhi = Math.sin(phi);
	let rV=[Math.cos(theta) * sinPhi, Math.cos(phi), Math.sin(theta) * sinPhi];
	cacheAG3.set(keyCheck,rV);
	return rV;
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

const perlin3 = (x, y, z) => {
	
    let x_0 = Math.floor(x), x_1 = x_0+1, y_0 = Math.floor(y), y_1 = y_0+1, z_0 = Math.floor(z), z_1 = z_0+1; 
	const g_000=angleGen3(x_0,y_0,z_0);
	const g_100=angleGen3(x_1,y_0,z_0);
	const g_010=angleGen3(x_0,y_1,z_0);
	const g_110=angleGen3(x_1,y_1,z_0);

	const g_001=angleGen3(x_0,y_0,z_1);
	const g_101=angleGen3(x_1,y_0,z_1);
	const g_011=angleGen3(x_0,y_1,z_1);
	const g_111=angleGen3(x_1,y_1,z_1);
    let frx=x-x_0;
    let fry=y-y_0;
	let frz=z-z_0;
    let u = fade(frx), v = fade(fry), w = fade(frz);
    let d_000 = [frx, fry, frz], d_100 = [frx-1, fry, frz], d_010 = [frx, fry-1, frz], d_110 = [frx-1, fry-1, frz];
	let d_001 = [frx, fry, frz-1], d_101 = [frx-1, fry, frz-1], d_011 = [frx, fry-1, frz-1], d_111 = [frx-1, fry-1, frz-1]; 
    let s_000 = dot3(g_000,d_000), s_100 = dot3(g_100,d_100), s_010 = dot3(g_010,d_010), s_110 = dot3(g_110,d_110); 
	let s_001 = dot3(g_001,d_001), s_101 = dot3(g_101,d_101), s_011 = dot3(g_011,d_011), s_111 = dot3(g_111,d_111); 
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
	+(perlin3(k/ 1,l/ 1.5,m/ 1)*(scale/heightScale)/4)
	//three octaves for now because five is super expensive.
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
noa.registry.registerMaterial('bedrock', {color:[0.1,0.1,0.1],});
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
	if(shouldBeCaveAir(x,y,z))return 0;
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
        for (var j = 0; j < data.shape[1]; j++) {
            for (var k = 0; k < data.shape[2]; k++) {
                var voxelID = getVoxelID(x + i, y + j, z + k)
                data.set(i, j, k, voxelID)
            }
        }
    }
    // tell noa the chunk's terrain data is now set
    noa.world.setChunkData(id, data)
});
var g=e.playerEntity,m=e.entities.getPositionData(g),d=m.width,f=m.height,z=e.rendering.getScene(),a=D("player-mesh",{},z);a.scaling.x=d;a.scaling.z=d;a.scaling.y=f;a.material=e.rendering.makeStandardMaterial();e.entities.addComponent(g,e.entities.names.mesh,{mesh:a,offset:[0,f/2,0]});e.inputs.down.on("fire",function(){if(e.targetedBlock){var r=e.targetedBlock.position;e.setBlock(0,r[0],r[1],r[2])}});e.inputs.down.on("alt-fire",function(){if(e.targetedBlock){var r=e.targetedBlock.adjacent;e.setBlock(grassID,r[0],r[1],r[2])}});e.inputs.bind("alt-fire","KeyE");e.on("tick",function(r){var t=e.inputs.pointerState.scrolly;t!==0&&(e.camera.zoomDistance+=t>0?1:-1,e.camera.zoomDistance<0&&(e.camera.zoomDistance=0),e.camera.zoomDistance>10&&(e.camera.zoomDistance=10))});
