import mongoose, { type Model, type Schema } from "mongoose";

/**
 * Register a Mongoose model; in development, drop a cached model so schema
 * changes (new fields) apply without restarting the server.
 */
export function registerModel<T>(
  name: string,
  schema: Schema<T>
): Model<T> {
  if (process.env.NODE_ENV === "development" && mongoose.models[name]) {
    mongoose.deleteModel(name);
  }
  return mongoose.models[name] as Model<T> | undefined ?? mongoose.model<T>(name, schema);
}
