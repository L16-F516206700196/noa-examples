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
	blockTestDistance:6,
	tickRate:20,
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
 *	  Registering voxel types
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
	coal_gen:[-360,-16,5,12,8],
	iron_gen:[-360,-48,4.5,9,7],
	gold_gen:[-360,-96,4,6,6],
	titanium_gen:[-360,-112,3,5,6],
	sapphire_gen:[-360,-144,3,5,5],
	diamond_gen:[-360,-192,2,4,5],
	emerald_gen:[-512,-288,1.5,3,4],
	adamantine_gen:[-864,-480,1,2,3],
}

const sounds={
	gravel:[1,2],
	stone:[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,39,40,41,42,43,44,45,46,47],
	wood:[32,35,36],
	foliage:[33,34,37,38],
}

// [blockID,x,y,z]
let queuedBlock=[

]

const genFunc=(x,y,z,oreS,genName)=>{
	let oreN=ID_TO_BLOCK[oreS];
	let genInfo=gens[genName],genAmt=genInfo[3];
	for(let I=0;I<genAmt;I++){
		let sr1=(Math.round(randomS(generateHash(`${x},${y},${z}|${seedNum}|${oreN}|${I}xu`)))-0.5)*2,
			sr2=(Math.round(randomS(generateHash(`${x},${y},${z}|${seedNum}|${oreN}|${I}zu`)))-0.5)*2;
		let r1=Math.round(sr1*(randomS(generateHash(`${x},${y},${z}|${seedNum}|${oreN}|${I}x`)))*Math.ceil(Math.sqrt(genInfo[4]))),
			r2=sr2*(randomS(generateHash(`${x},${y},${z}|${seedNum}|${oreN}|${I}z`)))*Math.ceil(Math.sqrt(genInfo[4]));
		if(isStone.includes(noa.getBlock(x+r1,y,z+r2)))queuedBlock.push([oreS,x+r1,y,z+r2]);
	}
	queuedBlock.push([oreS,x,y,z]);	
}
// l=Logs,f=Foliage,r=fRuit
const treeGen=[
	(x,y,z,s,l,f,r)=>{
		//length = 6-8
		let logHeight = 6+(Math.abs(generateHash(`${x},${y},${z}|${seedNum}|${s}`))%3);
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
	return y<(-480 + (generateHash(`${x},${y},${z}|${seedNum}|underworld_rock`)%3) )?r3:
	y<(-192 + (generateHash(`${x},${y},${z}|${seedNum}|depthstone`)%3) )?r2:
	r1;
}

noa.registry.registerMaterial('dirt', {textureURL:"/dirt.png"});
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

noa.registry.registerMaterial('underworld_rock', {textureURL:"/underworld_rock.png"});
noa.registry.registerMaterial('underworld_emerald_ore', {textureURL:"/underworld_emerald_ore.png"});
noa.registry.registerMaterial('underworld_adamantine_ore', {textureURL:"/underworld_adamantine_ore.png"});

noa.registry.registerMaterial('coal_gen', {textureURL:"/coal_ore.png"});
noa.registry.registerMaterial('iron_gen', {textureURL:"/iron_ore.png"});
noa.registry.registerMaterial('gold_gen', {textureURL:"/gold_ore.png"});
noa.registry.registerMaterial('titanium_gen', {textureURL:"/titanium_ore.png"});
noa.registry.registerMaterial('sapphire_gen', {textureURL:"/sapphire_ore.png"});
noa.registry.registerMaterial('diamond_gen', {textureURL:"/diamond_ore.png"});
noa.registry.registerMaterial('emerald_gen', {textureURL:"/emerald_ore.png"});
noa.registry.registerMaterial('adamantine_gen', {textureURL:"/adamantine_ore.png"});

noa.registry.registerMaterial('water', {color:[0.5,0.75,1,0.5]});

noa.registry.registerMaterial('log_oak', {textureURL:"/log_oak.png"});
noa.registry.registerMaterial('leaves_oak', {textureURL:"/leaves_oak.png"});
noa.registry.registerMaterial('leaves_oak_apple', {textureURL:"/leaves_oak_apple.png"});
noa.registry.registerMaterial('planks_oak', {textureURL:"/planks_oak.png"});
noa.registry.registerMaterial('log_oak_stripped', {textureURL:"/log_oak_stripped.png"});

//sapling
//sapling

noa.registry.registerMaterial('stone_brick', {textureURL:"/stone_brick.png"});
noa.registry.registerMaterial('stone_tiles', {textureURL:"/stone_tiles.png"});
noa.registry.registerMaterial('mini_stone_bricks', {textureURL:"/mini_stone_bricks.png"});
noa.registry.registerMaterial('depthstone_brick', {textureURL:"/depthstone_brick.png"});
noa.registry.registerMaterial('depthstone_tiles', {textureURL:"/depthstone_tiles.png"});
noa.registry.registerMaterial('mini_depthstone_bricks', {textureURL:"/mini_depthstone_bricks.png"});
noa.registry.registerMaterial('underworld_brick', {textureURL:"/underworld_brick.png"});
noa.registry.registerMaterial('underworld_tiles', {textureURL:"/underworld_tiles.png"});
noa.registry.registerMaterial('mini_underworld_bricks', {textureURL:"/mini_underworld_bricks.png"});
noa.registry.registerMaterial('grass_block_side',{textureURL:"/grass_block_side.png"})
//noa.registry.registerMaterial(name, {textureURL?: string, color?: number[]})
const BLOCK_TO_ID={
	"dirt":1,
	"grass_block_full":2,
	"stone":3,
	"depthstone":4,
	"bedrock":5,
	"coal_ore":noa.registry.registerBlock(6, {material: 'coal_ore'}),
	"iron_ore":noa.registry.registerBlock(7, {material: 'iron_ore'}),
	"gold_ore":noa.registry.registerBlock(8, {material: 'gold_ore'}),
	"titanium_ore":noa.registry.registerBlock(9, {material: 'titanium_ore'}),
	"sapphire_ore":noa.registry.registerBlock(10, {material: 'sapphire_ore'}),
	"diamond_ore":noa.registry.registerBlock(11, {material: 'diamond_ore'}),
	"depthstone_coal_ore":noa.registry.registerBlock(12, {material: 'depthstone_coal_ore'}),
	"depthstone_iron_ore":noa.registry.registerBlock(13, {material: 'depthstone_iron_ore'}),
	"depthstone_gold_ore":noa.registry.registerBlock(14, {material: 'depthstone_gold_ore'}),
	"depthstone_titanium_ore":noa.registry.registerBlock(15, {material: 'depthstone_titanium_ore'}),
	"depthstone_sapphire_ore":noa.registry.registerBlock(16, {material: 'depthstone_sapphire_ore'}),
	"depthstone_diamond_ore":noa.registry.registerBlock(17, {material: 'depthstone_diamond_ore'}),
	"depthstone_emerald_ore":noa.registry.registerBlock(18, {material: 'depthstone_emerald_ore'}),
	"depthstone_adamantine_ore":noa.registry.registerBlock(19, {material: 'depthstone_adamantine_ore'}),
	"underworld_rock":20,
	"underworld_emerald_ore":noa.registry.registerBlock(21, {material: 'underworld_emerald_ore'}),
	"underworld_adamantine_ore":noa.registry.registerBlock(22, {material: 'underworld_adamantine_ore'}),
	"coal_gen": noa.registry.registerBlock(23, {
		material: 'coal_gen',
		onSet: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,12,6),"coal_gen");
		},
		onLoad: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,12,6),"coal_gen");
		},
	}),
	"iron_gen": noa.registry.registerBlock(24, {
		material: 'iron_gen',
		onSet: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,13,7),"iron_gen");
		},
		onLoad: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,13,7),"iron_gen");
		},
	}),
	"gold_gen": noa.registry.registerBlock(25, {
		material: 'gold_gen',
		onSet: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,14,8),"gold_gen");
		},
		onLoad: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,14,8),"gold_gen");
		},
	}),
	"titanium_gen": noa.registry.registerBlock(26, {
		material: 'titanium_gen',
		onSet: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,15,9),"titanium_gen");
		},
		onLoad: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,15,9),"titanium_gen");
		},
	}),
	"sapphire_gen": noa.registry.registerBlock(27, {
		material: 'sapphire_gen',

		onSet: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,16,10),"sapphire_gen");
		},
		onLoad: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,16,10),"sapphire_gen");
		},
	}),
	"diamond_gen": noa.registry.registerBlock(28, {
		material: 'diamond_gen',
		onSet: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,17,11),"diamond_gen");
		},
		onLoad: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,20,17,11),"diamond_gen");
		},
	}),
	"emerald_gen": noa.registry.registerBlock(29, {
		material: 'emerald_gen',
		onSet: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,21,18,3),"emerald_gen");
		},
		onLoad: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,21,18,3),"emerald_gen");
		},
	}),
	"adamantine_gen": noa.registry.registerBlock(30, {
		material: 'adamantine_gen',
		onSet: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,22,19,3),"adamantine_gen");
		},
		onLoad: (x,y,z)=>{
			return genFunc(x,y,z,checkStoneT(x,y,z,22,19,3),"adamantine_gen");
		},
	}),
	"water":31,
	"log_oak":32,
	"leaves_oak":33,
	"leaves_oak_apple":34,
	"planks_oak": noa.registry.registerBlock(35, {material: 'planks_oak'}),
	"log_oak_stripped": noa.registry.registerBlock(36, {material: 'log_oak_stripped'}),
	"sapling_oak": noa.registry.registerBlock(37, {
		material: 'sapling_oak',
		onSet: (x,y,z)=>{
			return
		},
		onLoad: (x,y,z)=>{
			return
		},
	}),
	"sapling_oak_auto_gen":38,
	"stone_brick":noa.registry.registerBlock(39, {material: 'stone_brick'}),
	"stone_tiles":noa.registry.registerBlock(40, {material: 'stone_tiles'}),
	"mini_stone_bricks":noa.registry.registerBlock(41, {material: 'mini_stone_bricks'}),
	"depthstone_brick":noa.registry.registerBlock(42, {material: 'depthstone_brick'}),
	"depthstone_tiles":noa.registry.registerBlock(43, {material: 'depthstone_tiles'}),
	"mini_depthstone_bricks":noa.registry.registerBlock(44, {material: 'mini_depthstone_bricks'}),
	"underworld_brick":noa.registry.registerBlock(45, {material: 'underworld_brick'}),
	"underworld_tiles":noa.registry.registerBlock(46, {material: 'underworld_tiles'}),
	"mini_underworld_bricks":noa.registry.registerBlock(47, {material: 'mini_underworld_bricks'}),
	"grass_block_half":48,
};

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
];
// block types and their material names
var dirtID = noa.registry.registerBlock(1, {material: 'dirt'})
var grassFullID = noa.registry.registerBlock(2, {material: 'grass_block_top'})
var stoneID = noa.registry.registerBlock(3, {material: 'stone'})
var depthstoneID = noa.registry.registerBlock(4, {material: 'depthstone'})
var bedrockID = noa.registry.registerBlock(5, {material: 'bedrock'})
var underworld_rockID = noa.registry.registerBlock(20, {material: 'underworld_rock'})

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



var waterID=noa.registry.registerBlock(31,{material:"water",fluid:!0,fluidDensity:0.67});

var log_oakID = noa.registry.registerBlock(32, {material: 'log_oak'});
var leaves_oakID = noa.registry.registerBlock(33, {material: 'leaves_oak'});
var leaves_oak_appleID = noa.registry.registerBlock(34, {material: 'leaves_oak_apple'});

var sapling_oak_auto_genID = noa.registry.registerBlock(38, {
	material: 'sapling_oak_auto_gen',
	onSet: (x,y,z)=>{
		return treeGen[0](x,y,z,"sapling_oak",log_oakID,leaves_oakID,leaves_oak_appleID)
	},
	onLoad: (x,y,z)=>{
		return treeGen[0](x,y,z,"sapling_oak",log_oakID,leaves_oakID,leaves_oak_appleID)
	},
});
var grassHalfID = noa.registry.registerBlock(48, {material: ['grass_block_top','dirt','grass_block_side']});


const playBlockSound=blockID=>{
	if(sounds.gravel.includes(blockID)){playAudio(`../hello-world/sounds/gravel${Math.ceil(Math.random()*6)}.mp3`)}
	if(sounds.stone.includes(blockID)){playAudio(`../hello-world/sounds/stone${Math.ceil(Math.random()*6)}.mp3`)}
	if(sounds.wood.includes(blockID)){playAudio(`../hello-world/sounds/wood${Math.ceil(Math.random()*6)}.mp3`)}
}

//noa.registry.registerMaterial(blockID, opts)



/*
 * 
 *	  World generation
 * 
 *  The world is divided into chunks, and `noa` will emit an 
 *  `worldDataNeeded` event for each chunk of data it needs.
 *  The game client should catch this, and call 
 *  `noa.world.setChunkData` whenever the world data is ready.
 *  (The latter can be done asynchronously.)
 * 
*/

// simple height map worldgen function
function getVoxelID(x, y, z,height,data) {
	let amount = Math.round(height);
	let dx=x&15,dy=y&15,dz=z&15;
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
	if (y < -480 + (generateHash(`${x},${y},${z}|${seedNum}|underworld_rock`)%3))return underworld_rockID;
	if (y < -192 + (generateHash(`${x},${y},${z}|${seedNum}|depthstone`)%3))return depthstoneID
	if (y < amount-5) return stoneID
	if (y < amount-1) return dirtID
	
	if (y < amount) return grassFullID
	if (y >= amount && y < -2 && noa.getBlock(x,y-1,z)!==0) return waterID;
	let treeX=Math.round(randomS(generateHash(`${Math.floor(x/16)},${Math.floor(y/16)},${Math.floor(z/16)}|sapling_oak,x`))*8);
	let treeZ=Math.round(randomS(generateHash(`${Math.floor(x/16)},${Math.floor(y/16)},${Math.floor(z/16)}|sapling_oak,z`))*8);
	if(y<amount+1&&Math.floor(x/16)+treeX===x&&Math.floor(z/16)+treeZ===z&&data.get(dx,dy-1,dz)!==0)return sapling_oak_auto_genID;
	
	return 0 // signifying empty space
}

// register for world events
noa.world.on('worldDataNeeded', function (id, data, x, y, z) {
	console.log(data.get(0,0,0))
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
				var voxelID = getVoxelID(x + i, y + j, z + k,height,data);
				/*
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
				}*/
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
		var targetedBlockID=noa.targetedBlock.blockID;
		playBlockSound(targetedBlockID);
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
		
		if(toggleCheck){
			if(!noa.entities.isTerrainBlocked(pos[0], pos[1], pos[2])){
				playBlockSound(pickedID);
			}
		}else{
			playBlockSound(pickedID);
		}
		noa[toggleCheck?"addBlock":"setBlock"](pickedID, pos[0], pos[1], pos[2]);
		
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
	if(queuedBlock.length>0){
		for(let i=0;i<16;i++){
			if(queuedBlock.length<1)return;
			let queuedBlock0=queuedBlock[0];
			console.log(queuedBlock,queuedBlock0);
			noa.setBlock(...queuedBlock0);
			queuedBlock.splice(0,1);
		}
	}
	var scroll = noa.inputs.state.scrolly
	if (scroll !== 0) {
		noa.camera.zoomDistance += (scroll > 0) ? 1 : -1
		if (noa.camera.zoomDistance < 0) noa.camera.zoomDistance = 0
		if (noa.camera.zoomDistance > 10) noa.camera.zoomDistance = 10
	}
})
