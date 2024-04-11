import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {
      // 1. Encriptar la contraseña: npm i bcryptjs
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      await newUser.save();

      //extraemos el password del usuario para no exponerlo
      const { password:_ , ...user } = newUser.toJSON();
      return user;

      //2. Guardar el usuario

      //3. Generar el JWT


    } catch (error) {
      console.log(error.code);

      //El error 11000 es un codigo de error de MongoDB
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }

      throw new InternalServerErrorException('Something terrible happen¡¡¡');

    }


  }

  async login( loginDto: LoginDto){

    const { email, password } = loginDto;
    //                             ...findOne({ email })
    const user = await this.userModel.findOne({ email: email})

    if( !user ){
      throw new UnauthorizedException('Not valid credentials - email');
    }

    // Comparamos si las contraseñas no coinciden !
    if( !bcryptjs.compareSync( password, user.password) ){
      throw new UnauthorizedException('Not valid credentials - password')
    }

    const { password:_, ...rest } = user.toJSON();

    return {
      user: rest,
      token: 'ABC-123'
    }

    /** JWT
    * User { _id, name, email, roles } 
    * Token -> ASDASD.ASDASDASD.ASDASDASD
    */
    
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
