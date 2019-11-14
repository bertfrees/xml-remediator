
export default class Base64 {
    
    static base64abc = (() => {
        let abc = [],
            A = "A".charCodeAt(0),
            a = "a".charCodeAt(0),
            n = "0".charCodeAt(0);
        for (let i = 0; i < 26; ++i) {
            abc.push(String.fromCharCode(A + i));
        }
        for (let i = 0; i < 26; ++i) {
            abc.push(String.fromCharCode(a + i));
        }
        for (let i = 0; i < 10; ++i) {
            abc.push(String.fromCharCode(n + i));
        }
        abc.push("+");
        abc.push("/");
        return abc;
    })();

    static encodeBytes(bytes:Uint8Array):string{
        let result = '', i, l = bytes.length;
        for (i = 2; i < l; i += 3) {
            result += Base64.base64abc[bytes[i - 2] >> 2];
            result += Base64.base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
            result += Base64.base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
            result += Base64.base64abc[bytes[i] & 0x3F];
        }
        if (i === l + 1) { // 1 octet missing
            result += Base64.base64abc[bytes[i - 2] >> 2];
            result += Base64.base64abc[(bytes[i - 2] & 0x03) << 4];
            result += "==";
        }
        if (i === l) { // 2 octets missing
            result += Base64.base64abc[bytes[i - 2] >> 2];
            result += Base64.base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
            result += Base64.base64abc[(bytes[i - 1] & 0x0F) << 2];
            result += "=";
        }
        return result;
    }

    static encodeString(content:string){
        let bytes = new TextEncoder().encode(content);
        return Base64.encodeBytes(bytes);
    }

    static decode(base64:string){
        throw new Error("Unimplement method");
    }
}