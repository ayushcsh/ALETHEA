/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as chatid from "../chatid.js";
import type * as embedings from "../embedings.js";
import type * as generateUploadUrl from "../generateUploadUrl.js";
import type * as nodeActions from "../nodeActions.js";
import type * as savePdfMetadata from "../savePdfMetadata.js";
import type * as savepdfembeding from "../savepdfembeding.js";
import type * as sendMessage from "../sendMessage.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  chatid: typeof chatid;
  embedings: typeof embedings;
  generateUploadUrl: typeof generateUploadUrl;
  nodeActions: typeof nodeActions;
  savePdfMetadata: typeof savePdfMetadata;
  savepdfembeding: typeof savepdfembeding;
  sendMessage: typeof sendMessage;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
