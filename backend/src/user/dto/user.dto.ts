import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty({ message: 'Tên hiển thị không được để trống' })
  @IsString()
  @Length(1, 50, { message: 'Tên hiển thị phải từ 1-50 ký tự' })
  displayName: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  @IsString()
  oldPass: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @Length(6, 100, { message: 'Mật khẩu mới phải từ 6-100 ký tự' })
  newPass: string;
}
