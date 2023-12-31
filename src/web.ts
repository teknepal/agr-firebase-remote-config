import { registerPlugin, WebPlugin } from "@capacitor/core";
import firebase from "firebase";
import "firebase/remote-config";
import type {
  FirebaseRemoteConfigPlugin,
  initOptions,
  RCReturnData,
  RCValueOption,
} from "./definitions";

// Errors
const ErrRemoteConfigNotInitialiazed = new Error(
  "Remote config is not initialized. Make sure initialize() is called first."
);
const ErrMissingDefaultConfig = new Error("No default configuration found");

export class FirebaseRemoteConfigWeb
  extends WebPlugin
  implements FirebaseRemoteConfigPlugin
{
  private remoteConfigRef: firebase.remoteConfig.RemoteConfig;

  constructor() {
    super();
  }

  async initializeFirebase(app: firebase.app.App) {
    this.remoteConfigRef = app.remoteConfig();
  }

  async setDefaultConfig(options: any): Promise<void> {
    if (!options) throw ErrMissingDefaultConfig;

    if (!this.remoteConfigRef) throw ErrRemoteConfigNotInitialiazed;

    this.remoteConfigRef.defaultConfig = options;
    return;
  }

  async initialize(options?: initOptions): Promise<void> {
    if (!this.remoteConfigRef) throw ErrRemoteConfigNotInitialiazed;

    this.remoteConfigRef.settings = {
      minimumFetchIntervalMillis: 1000 * 60 * 60 * 12, // default: 12 hours
      fetchTimeoutMillis: 1 * 60000, // default: 1 minute
      ...options,
    };

    return;
  }

  async fetch(): Promise<void> {
    if (!this.remoteConfigRef) throw ErrRemoteConfigNotInitialiazed;

    const data = await this.remoteConfigRef.fetch();
    return data;
  }

  async activate(): Promise<void> {
    if (!this.remoteConfigRef) throw ErrRemoteConfigNotInitialiazed;

    await this.remoteConfigRef.activate();
    return;
  }

  async fetchAndActivate(): Promise<void> {
    if (!this.remoteConfigRef) throw ErrRemoteConfigNotInitialiazed;

    await this.remoteConfigRef.fetchAndActivate();
    return;
  }

  getBoolean(options: RCValueOption): Promise<RCReturnData<boolean>> {
    return this.getValue(options, "Boolean");
  }

  getNumber(options: RCValueOption): Promise<RCReturnData<number>> {
    return this.getValue(options, "Number");
  }

  getString(options: RCValueOption): Promise<RCReturnData> {
    return this.getValue(options, "String");
  }

  private async getValue<T>(
    options: RCValueOption,
    format: "String" | "Number" | "Boolean" = "String"
  ): Promise<RCReturnData<T>> {
    if (!this.remoteConfigRef)
      throw new Error(
        "Remote config is not initialized. Make sure initialize() is called at first."
      );
    const retVal = this.remoteConfigRef.getValue(options.key);
    return {
      key: options.key,
      value: (retVal as any)[`as${format}`](),
      source: retVal.getSource(),
    };
  }

  get remoteConfig() {
    return this.remoteConfigRef;
  }
}

const FirebaseRemoteConfig = registerPlugin<FirebaseRemoteConfigWeb>(
  "FirebaseRemoteConfig",
  {
    web: () => new FirebaseRemoteConfigWeb(),
  }
);

export { FirebaseRemoteConfig };
