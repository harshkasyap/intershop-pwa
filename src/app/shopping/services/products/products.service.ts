import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ProductData } from '../../../models/product/product.interface';
import { ProductMapper } from '../../../models/product/product.mapper';
import { Product } from '../../../models/product/product.model';

@Injectable()
export class ProductsService {

  private serviceIdentifier = 'products';

  constructor(
    private apiService: ApiService
  ) { }

  /**
   * REST API - Get full product data
   * @param productSku  The product SKU for the product of interest.
   * @returns           Product information.
   */
  getProduct(productSku: string): Observable<Product> {
    if (!productSku) {
      return ErrorObservable.create('getProduct() called without a productSku');
    }
    const params: HttpParams = new HttpParams().set('allImages', 'true');
    return this.apiService.get<ProductData>(this.serviceIdentifier + '/' + productSku, params, null, false, false).pipe(
      map(productData => ProductMapper.fromData(productData))
    );
  }

  // NEEDS_WORK: service should be parameterized with the category ID and not some URL, it should know its endpoint itself
  /**
   * REST API - Get product list data
   * @param  {string} url category url
   * @returns List of products as observable
  */
  getProductList(url: string): Observable<Product[]> {
    return this.apiService.get<ProductData[]>(url, null, null, true, true).pipe(
      map(productsData => productsData.map(
        product => ProductMapper.fromData(product)
      ))
    );
  }

  /**
   * returns a sorted list of all skus of products belonging to a given category
   * @param  {string} categoryUniqueId the category id
   * @param  {string} [sortKey=''] the sortKey used to sort the list, default value is ''
   * @returns List of product skus, the category id and the sort keys as observable
   */
  getProductSkuListForCategory(categoryUniqueId: string, sortKey = ''): Observable<{ skus: string[], categoryUniqueId: string, sortKeys: string[] }> {
    let url = `categories/${categoryUniqueId.replace(/\./g, '/')}/products?returnSortKeys=true`;
    if (sortKey) { url += `&sortKey=${sortKey}`; }
    return this.apiService.get<any>(url, null, null, false, false).pipe(
      map(response => ({
        skus: response.elements.map(el => el.uri.split('/').pop()),
        sortKeys: response.sortKeys,
        categoryUniqueId: categoryUniqueId
      }))
    );
  }

}
