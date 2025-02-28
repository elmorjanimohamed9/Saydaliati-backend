import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ConfigModule } from '@nestjs/config';
// import { FirebaseModule } from './firebase/firebase.module';
// import { AuthModule } from './auth/auth.module';
// import { PharmacyModule } from './pharmacy/pharmacy.module';
// import { PharmacyService } from './pharmacy/pharmacy.service';
// import { PharmacyController } from './pharmacy/pharmacy.controller';
// import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    // }),
    // FirebaseModule,
    // AuthModule,
    // PharmacyModule,
    // S3Module,
  ],
  // controllers: [AppController, PharmacyController],
  controllers: [AppController],
  providers: [AppService],
  // providers: [AppService, PharmacyService],
})
export class AppModule {}
