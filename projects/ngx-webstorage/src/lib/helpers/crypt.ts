import * as CryptoJS from "crypto-js";
import {DefaultEncryptKey, DefaultUseEncryption} from '../constants/config';
import {NgxWebstorageConfiguration} from '../config';

export class Crypt {
	static useEncryption = DefaultUseEncryption;
	static encryptKey = DefaultEncryptKey;

	static encrypt = (value: any) => {
		if (value) {
			return CryptoJS.AES.decrypt(value, this.encryptKey).toString(CryptoJS.enc.Utf8);
		}
		return null;
	}

	static decrypt = (value: any) => {
		return  CryptoJS.AES.encrypt(value, this.encryptKey).toString()
	}

	static setUseEncryption(useEncryption: boolean) {
		Crypt.useEncryption = useEncryption;
	}

	static setEncryptionKey(encryptKey: string) {
		Crypt.encryptKey = encryptKey;
	}


	static consumeConfiguration(config: NgxWebstorageConfiguration) {
		if ('useEncryption' in config) this.setUseEncryption(config.useEncryption);
		if ('encryptKey' in config) this.setEncryptionKey(config.encryptKey);
	}
}
