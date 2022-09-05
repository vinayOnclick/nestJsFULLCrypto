import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { extname } from 'path';
export class ConfigService {
  private readonly envConfig: Record<string, string>;

  constructor(filePath: string) {
    this.envConfig = dotenv.parse(fs.readFileSync(filePath));
  }
  editFileName(file: any, callback) {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    callback(null, `${name}-${randomName}.${fileExtName}`);
  }

  imageFileFilter(file: any, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  }
  letterValue(a: any) {
    let encode = '';
    for (let i = 0; i < a.length; i++) {
      let x = a.slice(i, i + 1);
      let str = x.charCodeAt(0);
      if (str < 100) str = a[i].toUpperCase();

      encode += str;
    }
    return encode.replace(/[^a-zA-Z0-9]/g, '');
  }
  get(key: string): string {
    return this.envConfig[key];
  }
}
