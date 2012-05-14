package com.wordassociation;

import org.appcelerator.titanium.ITiAppInfo;
import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiProperties;
import org.appcelerator.kroll.common.Log;

/* GENERATED CODE
 * Warning - this class was generated from your application's tiapp.xml
 * Any changes you make here will be overwritten
 */
public final class WordassociationAppInfo implements ITiAppInfo
{
	private static final String LCAT = "AppInfo";
	
	public WordassociationAppInfo(TiApplication app) {
		TiProperties properties = app.getSystemProperties();
		TiProperties appProperties = app.getAppProperties();
					
					properties.setString("acs-api-key-production", "VrJWDz8GP1h1afig0Fzg2WZBa0OsjDNX");
					appProperties.setString("acs-api-key-production", "VrJWDz8GP1h1afig0Fzg2WZBa0OsjDNX");
					
					properties.setString("acs-api-key-development", "6cbgmH4GxXLjmw2sy8Lx9CkTMRvILOac");
					appProperties.setString("acs-api-key-development", "6cbgmH4GxXLjmw2sy8Lx9CkTMRvILOac");
					
					properties.setString("acs-oauth-secret-development", "Rmm4vt7JmySzbyeNw2epeALvQYG4fbEJ");
					appProperties.setString("acs-oauth-secret-development", "Rmm4vt7JmySzbyeNw2epeALvQYG4fbEJ");
					
					properties.setString("ti.deploytype", "development");
					appProperties.setString("ti.deploytype", "development");
					
					properties.setString("acs-oauth-secret-production", "UbG92dH6k3tOTIAkVzGKk5NyuKzFUEZG");
					appProperties.setString("acs-oauth-secret-production", "UbG92dH6k3tOTIAkVzGKk5NyuKzFUEZG");
					
					properties.setString("acs-oauth-key-development", "QGxE9lcX9rOhvFOPAOvx1Cv3mp8aP53L");
					appProperties.setString("acs-oauth-key-development", "QGxE9lcX9rOhvFOPAOvx1Cv3mp8aP53L");
					
					properties.setString("acs-oauth-key-production", "Ofmd4ocAx51JnDD4karVwG7PWaXUnVtg");
					appProperties.setString("acs-oauth-key-production", "Ofmd4ocAx51JnDD4karVwG7PWaXUnVtg");
	}
	
	public String getId() {
		return "com.wordassociation";
	}
	
	public String getName() {
		return "WordAssociation";
	}
	
	public String getVersion() {
		return "1.0";
	}
	
	public String getPublisher() {
		return "serverdev";
	}
	
	public String getUrl() {
		return "http://wordassociation.com";
	}
	
	public String getCopyright() {
		return "2012 by serverdev";
	}
	
	public String getDescription() {
		return "not specified";
	}
	
	public String getIcon() {
		return "appicon.png";
	}
	
	public boolean isAnalyticsEnabled() {
		return true;
	}
	
	public String getGUID() {
		return "5b7e986f-62d1-4c2a-814f-2ba609a65f2e";
	}
	
	public boolean isFullscreen() {
		return false;
	}
	
	public boolean isNavBarHidden() {
		return false;
	}
}
