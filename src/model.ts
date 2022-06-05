import { Schema } from "mongoose";
import { SchemaDefinition } from "mongoose";
import { model } from "mongoose";
import { Model } from "mongoose";

const sanitizer = require("mongoose-sanitize");

interface Index {
	fields: any;
	options: any;
}

type Plugin = [(schema: Schema<any>, options: {}) => void, Record<string, any>];

export class MongoModel {
	private _name: string;
	private _fields: object;
	private _encrypted_fields: Array<string>;
	private _indexes: Array<Index>;
	private _schema: Schema;
	private _model: Model<any>;

	private _plugins: Array<Plugin>;

	constructor(
		name: string,
		fields: SchemaDefinition,
		time_stamps: boolean,
		encrypted_fields?: Array<string>,
		indexes?: Array<Index>,
		plugins?: Array<any>
	) {
		this._name = name;
		this._fields = fields;
		this._encrypted_fields = encrypted_fields || [];
		this._indexes = indexes || [];
		this._plugins = plugins || [];
		let field_names = Object.keys(fields);
		if (
			!this._encrypted_fields.every((field) =>
				field_names.includes(field)
			)
		) {
			throw Error("Invalid encrypted fields.");
		}

		this._schema = new Schema(fields, {
			timestamps: time_stamps,
		});
		for (let i = 0; i < this._indexes.length; i++) {
			this._schema.index(
				this._indexes[i].fields,
				this._indexes[i].options
			);
		}
		this._schema.plugin(sanitizer, {});
		for (let i of this._plugins) {
			this._schema.plugin(i[0], i[1]);
		}

		this._model = model(name, this._schema);
	}

	public get name(): string {
		return this._name;
	}

	public get fields(): object {
		return this._fields;
	}

	public get encrypted_fields(): Array<string> {
		return this._encrypted_fields;
	}

	public get model(): Model<any> {
		return this._model;
	}
}
