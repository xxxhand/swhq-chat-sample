export enum AdvertisementLocation {
  LT = 'LT',
  RT = 'RT',
  LM = 'LM',
};

export enum AdvertisementType {
  BROADCAST = 'broadcast',
  ADVERTISEMENT = 'advertisement',
};

export class AdvertisementMessage {
  public acceptedTags: string[] = [];
  public content: string = '';
  public img: string = '';
  public linkUrl: string = '';
  public location: AdvertisementLocation = AdvertisementLocation.LT;
  public type: AdvertisementType = AdvertisementType.ADVERTISEMENT;
};
