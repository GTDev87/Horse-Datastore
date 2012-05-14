/**
* Appcelerator Titanium Mobile
* This is generated code. Do not modify. Your changes *will* be lost.
* Generated code is Copyright (c) 2009-2011 by Appcelerator, Inc.
* All Rights Reserved.
*/
#import <Foundation/Foundation.h>
#import "TiUtils.h"
#import "ApplicationDefaults.h"
 
@implementation ApplicationDefaults
  
+ (NSMutableDictionary*) copyDefaults
{
    NSMutableDictionary * _property = [[NSMutableDictionary alloc] init];

    [_property setObject:[TiUtils stringValue:@"UbG92dH6k3tOTIAkVzGKk5NyuKzFUEZG"] forKey:@"acs-oauth-secret-production"];
    [_property setObject:[TiUtils stringValue:@"Ofmd4ocAx51JnDD4karVwG7PWaXUnVtg"] forKey:@"acs-oauth-key-production"];
    [_property setObject:[TiUtils stringValue:@"VrJWDz8GP1h1afig0Fzg2WZBa0OsjDNX"] forKey:@"acs-api-key-production"];
    [_property setObject:[TiUtils stringValue:@"Rmm4vt7JmySzbyeNw2epeALvQYG4fbEJ"] forKey:@"acs-oauth-secret-development"];
    [_property setObject:[TiUtils stringValue:@"QGxE9lcX9rOhvFOPAOvx1Cv3mp8aP53L"] forKey:@"acs-oauth-key-development"];
    [_property setObject:[TiUtils stringValue:@"6cbgmH4GxXLjmw2sy8Lx9CkTMRvILOac"] forKey:@"acs-api-key-development"];

    return _property;
}
@end
