import * as Bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';

export class Utils {
  public MAX_TOKEN_TIME = 60 * 60 * 1e3;

  public genreateVerificationToken = (size) =>
    customAlphabet('123456789', size)();



   async encryptPassword(password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      Bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }
}
