import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString()
  @Length(4, 20, { message: 'Tên đăng nhập phải từ 4-20 ký tự' })
  username: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @Length(6, 100, { message: 'Mật khẩu phải từ 6-100 ký tự' })
  pass: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString()
  @Length(4, 20, { message: 'Tên đăng nhập phải từ 4-20 ký tự' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Tên đăng nhập chỉ được chứa chữ cái, số, gạch nối và gạch dưới',
  })
  username: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @Length(6, 100, { message: 'Mật khẩu phải từ 6-100 ký tự' })
  pass: string;
}
