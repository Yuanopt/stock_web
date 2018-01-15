import{ Component,Input } from '@angular/core';
import{ Stock } from './stock';

@Component({
    selector: 'favorite-list',
    templateUrl: './favoritelist.component.html',
    styleUrls:['./favoritelist.component.css']
})

export class FavoriteList{
    @Input() stock:Stock;

}