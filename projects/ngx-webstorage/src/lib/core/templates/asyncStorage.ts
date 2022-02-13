import {distinctUntilChanged, filter, map, shareReplay, switchMap} from 'rxjs/operators';
import {StorageStrategy} from '../interfaces/storageStrategy';
import {Observable} from 'rxjs';
import {StorageService} from '../interfaces/storageService';
import {StorageKeyManager} from '../../helpers/storageKeyManager';
import {Crypt} from '../../helpers/crypt';
import {NgxWebstorageConfiguration} from '../../config';

export class AsyncStorage implements StorageService {

	constructor(protected strategy: StorageStrategy<any>) {
	}

	retrieve(key: string): Observable<any> {
		return this.strategy.get(StorageKeyManager.normalize(key)).pipe(
			map((value: any) => {
				if (Crypt.useEncryption) return Crypt.decrypt(value);
				return typeof value === 'undefined' ? null : value
			})
		);
	}

	store(key: string, value: any): Observable<any> {
		return this.strategy.set(StorageKeyManager.normalize(key), Crypt.useEncryption ? Crypt.encrypt(value) : value);
	}

	clear(key?: string): Observable<void> {
		return key !== undefined ? this.strategy.del(StorageKeyManager.normalize(key)) : this.strategy.clear();
	}

	getStrategyName(): string { return this.strategy.name; }

	observe(key: string): Observable<any> {
		key = StorageKeyManager.normalize(key);
		return this.strategy.keyChanges.pipe(
			filter((changed: string) => changed === null || changed === key),
			switchMap(() => this.strategy.get(key)),
			distinctUntilChanged(),
			shareReplay()
		);
	}

	static consumeConfiguration(config: NgxWebstorageConfiguration) {
	}
}
