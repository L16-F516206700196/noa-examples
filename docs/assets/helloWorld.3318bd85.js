import{E as Engine}from"./index.2b3d1184.js";import{C as D}from"./babylon.39bd9ef3.js";
var opts = {
    debug: true,
    showFPS: true,
    chunkSize: 16,
    chunkAddDistance: 5,
    chunkRemoveDistance: 7,
	playerWidth:0.5,
	playerHeight:1.8,
	texturePath:"textures/",
    // See `test` example, or noa docs/source, for more options
}
var noa = new Engine(opts),e=noa;
var permutationTable=[];
for(let i=0;i<256;i++){permutationTable.push(i)}
//perlin by FWJ7 / L16_F51620, normalisation for angleGen3 by GPT 5.4 nano (idk trig lol)
let seedNum = 0;
let scale=16;
let heightScale=2.5;
let caveHeightScale=3;
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
let caveThreshold = 0.64, leniency = 0.066;
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
    for(let i of rgba.map(h=>Math.floor(h))){
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
	let j = Math.floor(randomS(generateHash(`${seedNum}|${i}`))*i);
	[permutationTable[i],permutationTable[j]]=[permutationTable[j],permutationTable[i]];
}


const angleGen = (x, y) => {
	let hash=Math.abs(generateHash(`${x},${y}|${seedNum}`));
	return gradientTable[hash & 7];
}

const angleGen3 = (x, y, z) => {
	let hash=Math.abs(generateHash(`${x},${y},${z}|${seedNum}`));
	return gradientTable3[hash % 12];
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
	return (perlin3(k/16,l/24,m/16)*(scale/caveHeightScale)/16)
	+(perlin3(k/ 8,l/ 12,m/ 8)*(scale/caveHeightScale)/8)
	+(perlin3(k/ 3,l/ 4.5,m/ 3)*(scale/caveHeightScale)/4)
	+(perlin3(k/ 1,l/ 1.5,m/ 1)*(scale/caveHeightScale)/8);
}
const shouldBeCaveAir = (x, y, z) => {
	const sx=1,sy=1,sz=1;
	let cV=evalPerlinWithFBM(x*sx,y*sy,z*sz);
	cV+=9/8
	cV/=9/4;
	const t=smoothstep(caveThreshold-leniency,caveThreshold+leniency,cV)
	let k=x/scale,l=y/scale,m=z/scale;
	let tunnel=perlin3(k/12,l/12,m/12)*((scale/caveHeightScale)/8)
	tunnel+=11/32;
	tunnel*=16/11
	return t>0.5&&tunnel>0.12;
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

const setBlockRect=(x1,y1,z1,x2,y2,z2,b)=>{
	let X=1+(Math.max(x2,x1)-Math.min(x2,x1)),
		Y=1+(Math.max(y2,y1)-Math.min(y2,y1)),
		Z=1+(Math.max(z2,z1)-Math.min(z2,z1));
	for(let I=0;I<X;I++){
		for(let J=0;J<Y;J++){
			for(let K=0;K<Z;K++){
				noa.setBlock(b,x1+I,y1+J,z1+K);
			}
		}
	}
};

const setBlockRectR=(x1,y1,z1,x2,y2,z2,c,b1,b2)=>{
	let X=1+(Math.max(x2,x1)-Math.min(x2,x1)),
		Y=1+(Math.max(y2,y1)-Math.min(y2,y1)),
		Z=1+(Math.max(z2,z1)-Math.min(z2,z1));
	for(let I=0;I<X;I++){
		for(let J=0;J<Y;J++){
			for(let K=0;K<Z;K++){
				let rn=0.5+(generateHash(`${x1+I},${y1+J},${z1+K}|${seedNum}`)/4294967295);
				noa.setBlock(rn<c?b1:b2,x1+I,y1+J,z1+K);
			}
		}
	}
};

const playAudio = src => {
	var audio = new Audio(src);
	audio.play();
}

// block materials

let isOre=[
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	21,
	22
]
let isStone=[
	3,
	4,
	20,
]
let gens={
	coal_gen:[-360,-16,5,12],
	iron_gen:[-360,-48,4.5,9],
	gold_gen:[-360,-96,4,6],
	titanium_gen:[-360,-112,3,5],
	sapphire_gen:[-360,-144,3,5],
	diamond_gen:[-360,-192,2,4],
	emerald_gen:[-512,-288,1.5,3],
	adamantine_gen:[-864,-480,1,2],
}
const BLOCK_TO_ID={
	"dirt":1,
	"grass_block_top":2,
	"stone":3,
	"depthstone":4,
	"bedrock":5,
	"coal_ore":6,
	"iron_ore":7,
	"gold_ore":8,
	"titanium_ore":9,
	"sapphire_ore":10,
	"diamond_ore":11,
	"depthstone_coal_ore":12,
	"depthstone_iron_ore":13,
	"depthstone_gold_ore":14,
	"depthstone_titanium_ore":15,
	"depthstone_sapphire_ore":16,
	"depthstone_diamond_ore":17,
	"depthstone_emerald_ore":18,
	"depthstone_adamantine_ore":19,
	"underworld_stone":20,
	"underworld_stone_emerald_ore":21,
	"underworld_stone_adamantine_ore":22,
	"coal_gen":23,
	"iron_gen":24,
	"gold_gen":25,
	"titanium_gen":26,
	"sapphire_gen":27,
	"diamond_gen":28,
	"emerald_gen":29,
	"adamantine_gen":30,
	"water":31,
	"oak_sapling":32,
	"oak_sapling_auto_gen":33
};
const sounds={
	gravel:[1,2,32,33],
	stone:[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
	wood:[34],
}
const BlockMD={
	1:{
		audio:"gravel",
	},
	2:{
		audio:"gravel",
	},
	3:{
		audio:"stone",
	},
	4:{
		audio:"stone",
	},
}
const Blocks=Object.keys(BLOCK_TO_ID),BIds=Object.values(BLOCK_TO_ID);
let ID_TO_BLOCK=[
	"air",
	...Blocks
]

const genFunc=(x,y,z,oreS,genName)=>{
	let oreN=ID_TO_BLOCK[oreS];
	let genAmt=gens[genName][3];
	for(let I=0;I<genAmt;I++){
		let r1=(generateHash(`${x},${y},${z}|${seedNum}|${oreN}|${I}x`))%5,
			r2=(generateHash(`${x},${y},${z}|${seedNum}|${oreN}|${I}z`))%5;
		if(isStone.includes(noa.getBlock(x+r1,y,z+r2)))noa.setBlock(oreS,x+r1,y,z+r2);
	}
	noa.setBlock(oreS,x,y,z);	
}
// l=Logs,f=Foliage,r=fRuit
const treeGen=[
	(x,y,z,l,f,r)=>{
		//length = 6-8
		let logHeight = 6+(Math.abs(generateHash(`${x},${y},${z}|${seedNum}|oak_sapling`))%3);
		setBlockRectR(x-3,y+(logHeight-2),z-1,x+3,y+(logHeight+2),z+1,0.05,r,f);
		setBlockRectR(x-2,y+(logHeight-3),z-1,x+2,y+(logHeight+3),z+1,0.05,r,f);

		setBlockRectR(x-2,y+(logHeight-1),z-2,x+2,y+(logHeight+1),z-2,0.05,r,f);
		setBlockRectR(x-1,y+(logHeight-2),z-2,x+1,y+(logHeight+2),z-2,0.05,r,f);

		setBlockRectR(x-2,y+(logHeight-1),z+2,x+2,y+(logHeight+1),z+2,0.05,r,f);
		setBlockRectR(x-1,y+(logHeight-2),z+2,x+1,y+(logHeight+2),z+2,0.05,r,f);

		setBlockRectR(x-1,y+(logHeight-1),z-3,x+1,y+(logHeight+1),z-3,0.05,r,f);
		setBlockRectR(x-1,y+(logHeight-1),z+3,x+1,y+(logHeight+1),z+3,0.05,r,f);
		setBlockRect(x,y,z,x,y+(logHeight-1),z,l);
	}
]

const checkStoneT=(x,y,z,r3,r2,r1)=>{
	return y<(-480 + (generateHash(`${x},${y},${z}|${seedNum}|underworld_stone`)%3) )?r3:
	y<(-192 + (generateHash(`${x},${y},${z}|${seedNum}|depthstone`)%3) )?r2:
	r1;
}

noa.registry.registerMaterial('dirt', {textureURL:"/dirst.png"});
noa.registry.registerMaterial('grass_block_top', {textureURL:"/grass_block_top.png"});
noa.registry.registerMaterial('stone', {textureURL:"/stone.png"}); //stone
noa.registry.registerMaterial('depthstone', {textureURL:"/depthstone.png"}); //darker stone
noa.registry.registerMaterial('bedrock', {textureURL:"/bedrock.png"});

noa.registry.registerMaterial('coal_ore', {textureURL:"/coal_ore.png"});
noa.registry.registerMaterial('iron_ore', {textureURL:"/iron_ore.png"});
noa.registry.registerMaterial('gold_ore', {textureURL:"/gold_ore.png"});
noa.registry.registerMaterial('titanium_ore', {textureURL:"/titanium_ore.png"});
noa.registry.registerMaterial('sapphire_ore', {textureURL:"/sapphire_ore.png"});
noa.registry.registerMaterial('diamond_ore', {textureURL:"/diamond_ore.png"});

noa.registry.registerMaterial('depthstone_coal_ore', {textureURL:"/depthstone_coal_ore.png"});
noa.registry.registerMaterial('depthstone_iron_ore', {textureURL:"/depthstone_iron_ore.png"});
noa.registry.registerMaterial('depthstone_gold_ore', {textureURL:"/depthstone_gold_ore.png"});
noa.registry.registerMaterial('depthstone_titanium_ore', {textureURL:"/depthstone_titanium_ore.png"});
noa.registry.registerMaterial('depthstone_sapphire_ore', {textureURL:"/depthstone_sapphire_ore.png"});
noa.registry.registerMaterial('depthstone_diamond_ore', {textureURL:"/depthstone_diamond_ore.png"});
noa.registry.registerMaterial('depthstone_emerald_ore', {textureURL:"/depthstone_emerald_ore.png"});
noa.registry.registerMaterial('depthstone_adamantine_ore', {textureURL:"/depthstone_adamantine_ore.png"});

noa.registry.registerMaterial('underworld_stone', {textureURL:"/underworld_stone.png"});
noa.registry.registerMaterial('underworld_stone_emerald_ore', {textureURL:"/underworld_stone_emerald_ore.png"});
noa.registry.registerMaterial('underworld_stone_adamantine_ore', {textureURL:"/underworld_stone_adamantine_ore.png"});

noa.registry.registerMaterial('coal_gen', {textureURL:"/dirt.png"});
noa.registry.registerMaterial('iron_gen', {textureURL:"/dirt.png"});
noa.registry.registerMaterial('gold_gen', {textureURL:"/dirt.png"});
noa.registry.registerMaterial('titanium_gen', {textureURL:"/dirt.png"});
noa.registry.registerMaterial('sapphire_gen', {textureURL:"/dirt.png"});
noa.registry.registerMaterial('diamond_gen', {textureURL:"/dirt.png"});
noa.registry.registerMaterial('emerald_gen', {textureURL:"/dirt.png"});
noa.registry.registerMaterial('adamantine_gen', {textureURL:"/dirt.png"});

noa.registry.registerMaterial('water', {color:[0.5,0.75,1,0.5]});
//noa.registry.registerMaterial(name, {textureURL?: string, color?: number[]})

// block types and their material names
var dirtID = noa.registry.registerBlock(1, {material: 'dirt'})
var grassID = noa.registry.registerBlock(2, {material: 'grass_block_top'})
var stoneID = noa.registry.registerBlock(3, {material: 'stone'})
var depthstoneID = noa.registry.registerBlock(4, {material: 'depthstone'})
var bedrockID = noa.registry.registerBlock(5, {material: 'bedrock'})

var coal_oreID = noa.registry.registerBlock(6, {material: 'coal_ore'})
var iron_oreID = noa.registry.registerBlock(7, {material: 'iron_ore'})
var gold_oreID = noa.registry.registerBlock(8, {material: 'gold_ore'})
var titanium_oreID = noa.registry.registerBlock(9, {material: 'titanium_ore'})
var sapphire_oreID = noa.registry.registerBlock(10, {material: 'sapphire_ore'})
var diamond_oreID = noa.registry.registerBlock(11, {material: 'diamond_ore'})

var depthstone_coal_oreID = noa.registry.registerBlock(12, {material: 'depthstone_coal_ore'})
var depthstone_iron_oreID = noa.registry.registerBlock(13, {material: 'depthstone_iron_ore'})
var depthstone_gold_oreID = noa.registry.registerBlock(14, {material: 'depthstone_gold_ore'})
var depthstone_titanium_oreID = noa.registry.registerBlock(15, {material: 'depthstone_titanium_ore'})
var depthstone_sapphire_oreID = noa.registry.registerBlock(16, {material: 'depthstone_sapphire_ore'})
var depthstone_diamond_oreID = noa.registry.registerBlock(17, {material: 'depthstone_diamond_ore'})
var depthstone_emerald_oreID = noa.registry.registerBlock(18, {material: 'depthstone_emerald_ore'})
var depthstone_adamantine_oreID = noa.registry.registerBlock(19, {material: 'depthstone_adamantine_ore'})

var underworld_stoneID = noa.registry.registerBlock(20, {material: 'underworld_stone'})
var underworld_stone_emerald_oreID = noa.registry.registerBlock(21, {material: 'underworld_stone_emerald_ore'})
var underworld_stone_adamantine_oreID = noa.registry.registerBlock(22, {material: 'underworld_stone_adamantine_ore'})
let gei={
	"coal_gen":[20,12,6],
	"iron_gen":[20,13,7],
	"gold_gen":[20,14,8],
	"titanium_gen":[20,15,9],
	"sapphire_gen":[20,16,10],
	"diamond_gen":[20,17,11],
	"emerald_gen":[21,18,3],
	"adamantine_gen":[22,19,3],
};

var coal_genID = noa.registry.registerBlock(23, {
	material: 'coal_gen',
	/*
	onSet: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,12,6),"coal_gen");
	},
	onLoad: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,12,6),"coal_gen");
	},
	*/
});

var iron_genID = noa.registry.registerBlock(24, {
	material: 'iron_gen',
	/*
	onSet: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,13,7),"iron_gen");
	},
	onLoad: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,13,7),"iron_gen");
	},*/
});

var gold_genID = noa.registry.registerBlock(25, {
	material: 'gold_gen',
	/*
	onSet: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,14,8),"gold_gen");
	},
	onLoad: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,14,8),"gold_gen");
	},*/
});

var titanium_genID = noa.registry.registerBlock(26, {
	material: 'titanium_gen',
	/*
	onSet: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,15,9),"titanium_gen");
	},
	onLoad: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,15,9),"titanium_gen");
	},*/
});

var sapphire_genID = noa.registry.registerBlock(27, {
	material: 'sapphire_gen',
	/*
	onSet: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,16,10),"sapphire_gen");
	},
	onLoad: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,16,10),"sapphire_gen");
	},*/
});

var diamond_genID = noa.registry.registerBlock(28, {
	material: 'diamond_gen',
	/*
	onSet: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,17,11),"diamond_gen");
	},
	onLoad: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,20,17,11),"diamond_gen");
	},*/
});

var emerald_genID = noa.registry.registerBlock(29, {
	material: 'emerald_gen',
	/*
	onSet: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,21,18,3),"emerald_gen");
	},
	onLoad: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,21,18,3),"emerald_gen");
	},
	*/
});

var adamantine_genID = noa.registry.registerBlock(30, {
	material: 'adamantine_gen',
	/*
	onSet: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,22,19,3),"adamantine_gen");
	},
	onLoad: (x,y,z)=>{
		return genFunc(x,y,z,checkStoneT(x,y,z,22,19,3),"adamantine_gen");
	},*/
});

var waterID=noa.registry.registerBlock(31,{material:"water",fluid:!0,fluidDensity:0.67});
var oak_saplingID = noa.registry.registerBlock(32, {
	material: 'oak_sapling',
	onSet: (x,y,z)=>{
		return
	},
	onLoad: (x,y,z)=>{
		return
	},
});

var oak_sapling_auto_genID = noa.registry.registerBlock(33, {
	material: 'oak_sapling_auto_gen',
	onSet: (x,y,z)=>{
		return treeGen[0](x,y,z,1,2,3)
	},
	onLoad: (x,y,z)=>{
		return treeGen[0](x,y,z,1,2,3)
	},
});



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
	if (y < -864) return 0;
	if (y === -864) return bedrockID;
	if(shouldBeCaveAir(x,y,z)&&y<amount)return 0;
	for(let I of Object.keys(gens)){
		let J = gens[I]; // [min, max, chancePerBlock]
		if(Math.abs(generateHash(`${x},${y},${z}|${seedNum}|${I}`))%16384<=J[2]*4&&(y>=J[0]&&y<=J[1])){
			/*return y<(-256 + (generateHash(`${x},${y},${z}|${seedNum}|underworld_stone`)%3) )?BLOCK_TO_ID[`underworld_stone_${I}`]:
			y<(-128 + (generateHash(`${x},${y},${z}|${seedNum}|depthstone`)%3) )?BLOCK_TO_ID[`depthstone_${I}`]:
			BLOCK_TO_ID[I];*/
			return BLOCK_TO_ID[I];
		};
	}
	if (y < -480 + (generateHash(`${x},${y},${z}|${seedNum}|underworld_stone`)%3))return underworld_stoneID
	if (y < -192 + (generateHash(`${x},${y},${z}|${seedNum}|depthstone`)%3))return depthstoneID
	if (y < amount-5) return stoneID
    if (y < amount-1) return dirtID
    
    if (y < amount) return grassID
	if (y >= amount && y < -3 && noa.getBlock(x,y-1,z)) return waterID;
	let treeX=Math.abs(generateHash(`${Math.floor(x/16)},${Math.floor(y/16)},${Math.floor(z/16)}|oak_sapling,x`)) & 7;
	let treeZ=Math.abs(generateHash(`${Math.floor(x/16)},${Math.floor(y/16)},${Math.floor(z/16)}|oak_sapling,z`)) & 7;
	if(y<amount+1&&treeX===x&&treeZ===z&&noa.getBlock(x,y-1,z))return oak_sapling_auto_genID;
	
    return 0 // signifying empty space
}

// register for world events
noa.world.on('worldDataNeeded', function (id, data, x, y, z) {
    // `id` - a unique string id for the chunk
    // `data` - an `ndarray` of voxel ID data (see: https://github.com/scijs/ndarray)
    // `x, y, z` - world coords of the corner of the chunk
    for (var i = 0; i < data.shape[0]; i++) {
        for (var k = 0; k < data.shape[2]; k++) {
			let l=(x+i)/scale;
			let m=(z+k)/scale;
			let height=(perlin(l,m)*(scale/heightScale))
			+(perlin(l/2,m/2)*(scale/heightScale)/2)
			+(perlin(l/4,m/4)*(scale/heightScale)/4)
			+(perlin(l/8,m/8)*(scale/heightScale)/8)
			+(perlin(l/16,m/16)*(scale/heightScale)/4)
			+(perlin(l/32,m/32)*(scale/heightScale)/8);
            for (var j = 0; j < data.shape[1]; j++) {
                var voxelID = getVoxelID(x + i, y + j, z + k,height);
				var voxelName=ID_TO_BLOCK[voxelID];
				if(Object.keys(gens).includes(voxelName)){
					let oreID=checkStoneT(x+i,y+j,z+k,...gei[voxelName]);
					let oreN=ID_TO_BLOCK[oreID];
					let genAmt=gens[voxelName][3];
					for(let I=0;I<genAmt;I++){
						let r1=(generateHash(`${x},${y},${z}|${seedNum}|${oreN}|${I}x`))%5,
							r2=(generateHash(`${x},${y},${z}|${seedNum}|${oreN}|${I}z`))%5;
						if(isStone.includes(noa.getBlock(x+i+r1,y+j,z+k+r2)))noa.setBlock(oreID,x+i+r1,y+j,z+k+r2);
					}
					return data.set(i,j,k,oreID);
					//genFunc(x+i,y+j,z+k,checkStoneT(x+i,y+j,z+k,...gei[voxelName]),voxelName);
				}
				data.set(i, j, k, voxelID);
            }
        }
    }
    // tell noa the chunk's terrain data is now set
    noa.world.setChunkData(id, data)
});

var g=e.playerEntity,m=e.entities.getPositionData(g),d=m.width,f=m.height,z=e.rendering.getScene(),a=D("player-mesh",{},z);var move = e.entities.getMovement(g);
move.maxSpeed = 7.2;move.running=!0;move.jumpImpulse=(84/11);move.moveForce = 60;move.jumpTime=0;move.airJumps=0;
noa.entities.getPhysicsBody(g).airDrag=0.1;
noa.entities.getPhysicsBody(g).friction=60;
a.scaling.x=d;a.scaling.z=d;a.scaling.y=f;
a.material=e.rendering.makeStandardMaterial();e.entities.addComponent(g,e.entities.names.mesh,{mesh:a,offset:[0,f/2,0]});

noa.inputs.down.on('fire', function () {
    if (noa.targetedBlock) {
        var pos = noa.targetedBlock.position
        noa.setBlock(0, pos[0], pos[1], pos[2])
    }
})
noa.inputs.bind('fire', 'KeyJ')
var pickedID=1;
var toggleCheck=!0;
// place some grass on right click
noa.inputs.down.on('mid-fire', function () {
    if (noa.targetedBlock) {
		pickedID=noa.targetedBlock.blockID;
    }
})
noa.inputs.bind('mid-fire', 'KeyK')

noa.inputs.down.on('alt-fire', function () {
    if (noa.targetedBlock) {
        var pos = noa.targetedBlock.adjacent
        noa[toggleCheck?"addBlock":"setBlock"](pickedID, pos[0], pos[1], pos[2])
		if(sounds.gravel.includes(pickedID)){playAudio(`../docs/hello-world/sounds/gravel${Math.ceil(Math.random()*6)}`)}
		if(sounds.stone.includes(pickedID)){playAudio(`../docs/hello-world/sounds/stone${Math.ceil(Math.random()*6)}`)}
		if(sounds.wood.includes(pickedID)){playAudio(`../docs/hello-world/sounds/wood${Math.ceil(Math.random()*6)}`)}
    }
})

// add a key binding for "E" to do the same as alt-fire
noa.inputs.bind('alt-fire', 'KeyE')

noa.inputs.bind('log-coords', 'KeyC')
noa.inputs.down.on('log-coords', function () {
    console.log(noa.entities.getPosition(g))
})

noa.inputs.bind("previous-block","KeyU");
noa.inputs.bind("next-block","KeyO");
noa.inputs.down.on('previous-block', function () {
    pickedID=Math.max(1,pickedID-1)
})
noa.inputs.down.on('next-block', function () {
    pickedID=Math.min(Object.keys(BLOCK_TO_ID).length,pickedID+1);
})
noa.inputs.bind("log-physics-body","KeyL");
noa.inputs.down.on("log-physics-body",()=>{
	console.log(noa.entities.getPhysicsBody(g).friction)
})
noa.inputs.bind("toggle-check-place","KeyQ");
noa.inputs.down.on("toggle-check-place",()=>{
	toggleCheck=!toggleCheck;
})
// each tick, consume any scroll events and use them to zoom camera
noa.on('tick', function (dt) {
    var scroll = noa.inputs.state.scrolly
    if (scroll !== 0) {
        noa.camera.zoomDistance += (scroll > 0) ? 1 : -1
        if (noa.camera.zoomDistance < 0) noa.camera.zoomDistance = 0
        if (noa.camera.zoomDistance > 10) noa.camera.zoomDistance = 10
    }
})
