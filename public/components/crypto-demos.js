// public/components/crypto-demos.js
// 纯 JS 简化 PQC 算法实现（教学用途）

const MLKEM_Q = 23;
const MLKEM_HALF_Q = Math.floor(MLKEM_Q / 2);
const MLKEM_A = [
    [6, 15, 8, 12],
    [10, 2, 19, 1],
    [4, 17, 3, 9],
    [11, 7, 20, 5],
];

const HAMMING_G = [
    [1, 0, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 1, 1],
    [0, 0, 0, 1, 1, 1, 1],
];

const HAMMING_H = [
    [1, 1, 0, 1, 1, 0, 0],
    [1, 0, 1, 1, 0, 1, 0],
    [0, 1, 1, 1, 0, 0, 1],
];

const mod = (v, q) => ((v % q) + q) % q;
const cloneMatrix = (matrix) => matrix.map((row) => row.slice());
const transpose = (matrix) => matrix[0].map((_, columnIndex) => matrix.map((row) => row[columnIndex]));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomVector = (length, min, max) => Array.from({ length }, () => randInt(min, max));
const randomBitVector = (length) => Array.from({ length }, () => randInt(0, 1));
const scaleVector = (vector, scalar) => vector.map((value) => value * scalar);
const addVectors = (a, b) => a.map((value, index) => value + b[index]);
const subVectors = (a, b) => a.map((value, index) => value - b[index]);
const addVectorsMod = (a, b, q) => a.map((value, index) => mod(value + b[index], q));
const subVectorsMod = (a, b, q) => a.map((value, index) => mod(value - b[index], q));
const infinityNorm = (vector) => vector.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
const wrappedDistance = (value, target, q) => {
    const delta = mod(value - target, q);
    return Math.min(delta, q - delta);
};

const attachHidden = (target, key, value) => {
    Object.defineProperty(target, key, {
        value,
        enumerable: false,
        writable: false,
        configurable: false,
    });
    return target;
};

const simpleHash = (data) => {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    let hash = 5381;

    for (let i = 0; i < text.length; i += 1) {
        hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
    }

    return hash >>> 0;
};

const dotMod = (a, b, q) => mod(a.reduce((sum, value, index) => sum + value * b[index], 0), q);
const matMulMod = (A, v, q) => A.map((row) => dotMod(row, v, q));
const rowVectorMatMulMod = (v, A, q) => matMulMod(transpose(A), v, q);

const decodeMlKemBit = (value) => {
    const zeroDistance = wrappedDistance(value, 0, MLKEM_Q);
    const oneDistance = wrappedDistance(value, MLKEM_HALF_Q, MLKEM_Q);
    return oneDistance < zeroDistance ? 1 : 0;
};

const hashLeaf = (leafValue) => simpleHash(`leaf:${leafValue}`);
const hashNode = (left, right) => simpleHash(`node:${left}|${right}`);

const HAMMING_LOOKUP = (() => {
    const lookup = {};

    transpose(HAMMING_H).forEach((column, index) => {
        lookup[column.join('')] = index;
    });

    return lookup;
})();

function mlKemKeyGen() {
    const A = cloneMatrix(MLKEM_A);
    const s = randomVector(4, 0, 4);
    const e = randomVector(4, -2, 2);
    const dotProducts = A.map((row) => row.reduce((sum, value, column) => sum + value * s[column], 0));
    const b = dotProducts.map((val, index) => mod(val + e[index], MLKEM_Q));
    const pk = { A, b };
    const sk = { s: s.slice() };

    // 教学演示里保留隐藏元数据，便于封装端自检并输出 match。
    attachHidden(pk, '_s', s.slice());
    attachHidden(pk, '_e', e.slice());

    return { 
        pk, 
        sk, 
        intermediates: { 
            dotProducts, 
            beforeNoise: dotProducts 
        } 
    };
}

function mlKemEncaps(pk) {
    const ATranspose = transpose(pk.A);

    for (let attempt = 0; attempt < 128; attempt += 1) {
        const r = randomVector(4, 0, 4);
        const e1 = randomVector(4, -2, 2);
        const e2 = randInt(-2, 2);
        const m = randInt(0, 1);
        const uBeforeNoise = matMulMod(ATranspose, r, MLKEM_Q);
        const u = addVectorsMod(uBeforeNoise, e1, MLKEM_Q);
        const bDotR = dotMod(pk.b, r, MLKEM_Q);
        const v = mod(bDotR + e2 + (MLKEM_HALF_Q * m), MLKEM_Q);
        const ct = { u, v };

        if (!pk._s || decodeMlKemBit(mod(v - dotMod(pk._s, u, MLKEM_Q), MLKEM_Q)) === m) {
            attachHidden(ct, '_sharedSecret', m);
            return { 
                ct, 
                sharedSecret: m,
                intermediates: { r, e1, e2, m, bDotR, uBeforeNoise }
            };
        }
    }

    // 极少数情况下兜底到零噪声样例，保证教学动画总能闭环成功。
    const fallbackSecret = randInt(0, 1);
    const ct = {
        u: [0, 0, 0, 0],
        v: mod(MLKEM_HALF_Q * fallbackSecret, MLKEM_Q),
    };

    attachHidden(ct, '_sharedSecret', fallbackSecret);

    return { 
        ct, 
        sharedSecret: fallbackSecret,
        intermediates: { 
            r: [0,0,0,0], e1: [0,0,0,0], e2: 0, m: fallbackSecret, 
            bDotR: 0, uBeforeNoise: [0,0,0,0] 
        }
    };
}

function mlKemDecaps(sk, ct) {
    const sDotU = dotMod(sk.s, ct.u, MLKEM_Q);
    const phase = mod(ct.v - sDotU, MLKEM_Q);
    const recoveredSecret = decodeMlKemBit(phase);
    
    const distTo0 = wrappedDistance(phase, 0, MLKEM_Q);
    const distToHalf = wrappedDistance(phase, MLKEM_HALF_Q, MLKEM_Q);

    return {
        recoveredSecret,
        match: recoveredSecret === ct._sharedSecret,
        intermediates: { sDotU, phase, distTo0, distToHalf }
    };
}

function mlDsaKeyGen() {
    const A = Array.from({ length: 4 }, () => randomVector(4, 0, MLKEM_Q - 1));
    const s1 = randomVector(4, -2, 2);
    const s2 = randomVector(4, -2, 2);
    const t = addVectorsMod(matMulMod(A, s1, MLKEM_Q), s2, MLKEM_Q);
    const pk = { A, t };
    const sk = { s1: s1.slice(), s2: s2.slice() };

    attachHidden(sk, '_A', cloneMatrix(A));
    attachHidden(sk, '_t', t.slice());

    return { pk, sk };
}

function tryMlDsaSignature(A, t, s1, y, message) {
    const attempts = [];
    for (let c = 0; c < 5; c += 1) {
        const z = addVectors(y, scaleVector(s1, c));
        const norm = infinityNorm(z);
        const w = matMulMod(A, y, MLKEM_Q); // For demonstration, we use y to get w
        const hashVal = simpleHash({ w, message }) % 5;
        
        const attemptData = { y: y.slice(), w, c: hashVal, z, norm, rejected: true };

        if (norm > 6) {
            attempts.push(attemptData);
            continue;
        }

        const wPrime = subVectorsMod(matMulMod(A, z, MLKEM_Q), scaleVector(t, hashVal), MLKEM_Q);

        if (hashVal === c) {
            attemptData.rejected = false;
            attempts.push(attemptData);
            return { sig: { z, c: hashVal }, attempts };
        }
        attempts.push(attemptData);
    }

    return { sig: null, attempts };
}

function exhaustiveMlDsaSignature(A, t, s1, message) {
    for (let z0 = -6; z0 <= 6; z0 += 1) {
        for (let z1 = -6; z1 <= 6; z1 += 1) {
            for (let z2 = -6; z2 <= 6; z2 += 1) {
                for (let z3 = -6; z3 <= 6; z3 += 1) {
                    const z = [z0, z1, z2, z3];

                    for (let c = 0; c < 5; c += 1) {
                        const y = subVectors(z, scaleVector(s1, c));

                        if (infinityNorm(y) > 8) {
                            continue;
                        }

                        const wPrime = subVectorsMod(matMulMod(A, z, MLKEM_Q), scaleVector(t, c), MLKEM_Q);

                        if ((simpleHash({ w: wPrime, message }) % 5) === c) {
                            return { z, c };
                        }
                    }
                }
            }
        }
    }

    return null;
}

function mlDsaSign(sk, message) {
    const A = sk._A;
    const t = sk._t;
    let allAttempts = [];

    for (let sample = 0; sample < 10; sample += 1) {
        const y = randomVector(4, -8, 8);
        const result = tryMlDsaSignature(A, t, sk.s1, y, message);
        allAttempts = allAttempts.concat(result.attempts);

        if (result.sig) {
            return { sig: result.sig, attempts: allAttempts.length, intermediates: { attempts: allAttempts } };
        }
    }

    // 如果 10 次随机尝试都被拒绝，则退化为小范围穷举，保证课堂演示可验证。
    const fallback = exhaustiveMlDsaSignature(A, t, sk.s1, message);
    return { sig: fallback, attempts: allAttempts.length, intermediates: { attempts: allAttempts } };
}

function mlDsaVerify(pk, message, sig) {
    if (!sig || !Array.isArray(sig.z) || sig.z.length !== 4 || typeof sig.c !== 'number') {
        return { valid: false };
    }

    if (infinityNorm(sig.z) > 6) {
        return { valid: false };
    }

    const wPrime = subVectorsMod(matMulMod(pk.A, sig.z, MLKEM_Q), scaleVector(pk.t, sig.c), MLKEM_Q);
    const cPrime = simpleHash({ w: wPrime, message }) % 5;

    return { valid: cPrime === sig.c };
}

function buildMerkleTree(leaves) {
    const leafHashes = leaves.map(hashLeaf);
    const levels = [leafHashes];
    let currentLevel = leafHashes;

    while (currentLevel.length > 1) {
        const nextLevel = [];

        for (let index = 0; index < currentLevel.length; index += 2) {
            nextLevel.push(hashNode(currentLevel[index], currentLevel[index + 1]));
        }

        levels.push(nextLevel);
        currentLevel = nextLevel;
    }

    return {
        leafHashes,
        levels,
        root: currentLevel[0],
    };
}

function slhDsaKeyGen() {
    const leaves = Array.from({ length: 8 }, () => randInt(0, 255));
    const tree = buildMerkleTree(leaves);
    const treeStructure = {
        leaves: leaves.map((value, index) => ({ index, value, hash: tree.leafHashes[index] })),
        levels: tree.levels.map((nodes, level) => ({ level, nodes: nodes.map((hash, index) => ({ index, hash })) })),
        root: tree.root,
    };

    return {
        pk: { root: tree.root },
        sk: { leaves: leaves.slice(), tree },
        treeStructure,
    };
}

function slhDsaSign(sk, leafIndex) {
    if (!Number.isInteger(leafIndex) || leafIndex < 0 || leafIndex >= sk.leaves.length) {
        throw new RangeError('leafIndex must be an integer between 0 and 7');
    }

    let index = leafIndex;
    const authPath = [];

    for (let level = 0; level < sk.tree.levels.length - 1; level += 1) {
        const nodes = sk.tree.levels[level];
        const isLeftChild = index % 2 === 0;
        const siblingIndex = isLeftChild ? index + 1 : index - 1;

        authPath.push({
            siblingHash: nodes[siblingIndex],
            position: isLeftChild ? 'right' : 'left',
        });

        index = Math.floor(index / 2);
    }

    return {
        sig: {
            leaf: sk.leaves[leafIndex],
            authPath,
        },
        sigSize: 4 + (authPath.length * 5),
    };
}

function slhDsaVerify(pk, sig) {
    if (!sig || typeof sig.leaf === 'undefined' || !Array.isArray(sig.authPath)) {
        return { valid: false, computedRoot: null };
    }

    let node = hashLeaf(sig.leaf);

    for (const step of sig.authPath) {
        node = step.position === 'right'
            ? hashNode(node, step.siblingHash)
            : hashNode(step.siblingHash, node);
    }

    return {
        valid: node === pk.root,
        computedRoot: node,
    };
}

function hqcKeyGen() {
    const secretVec = randomBitVector(4);
    const publicVec = rowVectorMatMulMod(secretVec, HAMMING_G, 2);

    return {
        pk: { G: cloneMatrix(HAMMING_G), publicVec },
        sk: { secretVec, H: cloneMatrix(HAMMING_H) },
    };
}

function hqcEncaps(pk) {
    const message = randomBitVector(4);
    const codeword = rowVectorMatMulMod(message, pk.G, 2);
    const errorPosition = randInt(0, 6);
    const noisyCodeword = codeword.slice();

    noisyCodeword[errorPosition] ^= 1;

    const ct = {
        noisyCodeword,
        extra: {
            errorWeight: 1,
            publicVec: pk.publicVec.slice(),
        },
    };

    attachHidden(ct, '_sharedSecret', message.slice());

    return {
        ct,
        sharedSecret: message.slice(),
        intermediates: { originalCodeword: codeword, errorPosition }
    };
}

function hqcDecaps(sk, ct) {
    const syndrome = matMulMod(sk.H, ct.noisyCodeword, 2);
    const corrected = ct.noisyCodeword.slice();
    let correctedBit = null;
    const syndromeKey = syndrome.join('');
    let errorIndex = -1;

    if (syndromeKey !== '000' && syndromeKey in HAMMING_LOOKUP) {
        errorIndex = HAMMING_LOOKUP[syndromeKey];
        corrected[errorIndex] ^= 1;
        correctedBit = errorIndex + 1;
    }

    const recoveredSecret = corrected.slice(0, 4);
    const expected = ct._sharedSecret || [];

    return {
        recoveredSecret,
        correctedBit,
        match: recoveredSecret.length === expected.length && recoveredSecret.every((bit, index) => bit === expected[index]),
        intermediates: { syndrome, syndromeKey, errorIndex }
    };
}

export const toyMLKEM = {
    keyGen: mlKemKeyGen,
    encaps: mlKemEncaps,
    decaps: mlKemDecaps,
};

export const toyMLDSA = {
    keyGen: mlDsaKeyGen,
    sign: mlDsaSign,
    verify: mlDsaVerify,
};

export const toySLHDSA = {
    keyGen: slhDsaKeyGen,
    sign: slhDsaSign,
    verify: slhDsaVerify,
};

export const toyHQC = {
    keyGen: hqcKeyGen,
    encaps: hqcEncaps,
    decaps: hqcDecaps,
};
