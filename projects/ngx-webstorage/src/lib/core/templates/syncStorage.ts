import {Observable} from 'rxjs';
import {distinctUntilChanged, filter, shareReplay, switchMap} from 'rxjs/operators';
import {StorageStrategy} from '../interfaces/storageStrategy';
import {noop} from '../../helpers/noop';
import {StorageService} from '../interfaces/storageService';
import {StorageKeyManager} from '../../helpers/storageKeyManager';
import {Crypt} from '../../helpers/crypt';
import {NgxWebstorageConfiguration} from '../../config';

export class SyncStorage implements StorageService {
	constructor(protected strategy: StorageStrategy<any>) {
	}

	retrieve(key: string): any {
		let value: any;
		this.strategy.get(StorageKeyManager.normalize(key)).subscribe((result) => value = typeof result === 'undefined' ? null : result);
		if (Crypt.useEncryption) return Crypt.decrypt(value);
		return value;
	}

	store(key: string, value: any): any {
		this.strategy.set(StorageKeyManager.normalize(key), value).subscribe(noop);
		if (Crypt.useEncryption) return Crypt.encrypt(value);
		return value;
	}

	clear(key?: string): void {
		if (key !== undefined)
			this.strategy.del(StorageKeyManager.normalize(key)).subscribe(noop);
		else this.strategy.clear().subscribe(noop);
	}

	getStrategyName(): string {return this.strategy.name; }

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
