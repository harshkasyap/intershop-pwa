import { Inject, Injectable } from '@angular/core';

import { ICM_BASE_URL } from 'ish-core/utils/state-transfer/factories';
import { CategoryTreeHelper } from '../category-tree/category-tree.helper';
import { CategoryTree } from '../category-tree/category-tree.model';
import { ImageMapper } from '../image/image.mapper';

import { CategoryData, CategoryPathElement } from './category.interface';
import { Category, CategoryHelper } from './category.model';

@Injectable({ providedIn: 'root' })
export class CategoryMapper {
  constructor(@Inject(ICM_BASE_URL) public icmBaseURL, private imageMapper: ImageMapper) {}

  /**
   * Utility Method:
   * Maps the incoming raw category path to a path with unique IDs.
   */
  mapCategoryPath(path: CategoryPathElement[]) {
    if (path && path.length) {
      const ret = [];
      ret.push(path[0].id);
      path
        .map(el => el.id)
        .reduce((acc, item) => {
          const r = acc + CategoryHelper.uniqueIdSeparator + item;
          ret.push(r);
          return r;
        });
      return ret;
    }
    throw new Error('input is falsy');
  }

  /**
   * Utility Method:
   * Creates Category stubs from the category path (excluding the last element)
   */
  categoriesFromCategoryPath(path: CategoryPathElement[]): CategoryTree {
    if (!path || !path.length) {
      return CategoryTreeHelper.empty();
    }

    let uniqueId;
    const newCategoryPath = [];

    return (
      path
        // remove the last
        .filter((_, idx, arr) => idx !== arr.length - 1)
        .map(pathElement => {
          // accumulate and construct uniqueId and categoryPath
          uniqueId = !uniqueId ? pathElement.id : uniqueId + CategoryHelper.uniqueIdSeparator + pathElement.id;
          newCategoryPath.push(uniqueId);

          // yield category stub
          return {
            uniqueId,
            name: pathElement.name,
            completenessLevel: 0,
            categoryPath: [...newCategoryPath],
          };
        })
        // construct a tree from it
        .reduce((tree, cat: Category) => CategoryTreeHelper.add(tree, cat), CategoryTreeHelper.empty())
    );
  }

  /**
   * Compute completeness level of incoming raw data.
   */
  computeCompleteness(categoryData: CategoryData): number {
    if (!categoryData) {
      return -1;
    }

    // adjust CategoryHelper.maxCompletenessLevel accordingly
    let count = 0;

    if (!categoryData.uri) {
      // returned subcategories and elements from the top-level category call contain uri
      count++;
    }
    if (categoryData.images) {
      // images are not supplied with top level category call
      count++;
    }
    if (categoryData.categoryPath && categoryData.categoryPath.length === 1) {
      // root categories have no images but a single-entry categoryPath
      count++;
    }

    return count;
  }

  /**
   * Maps a raw {@link CategoryData} element to a {@link Category} element ignoring subcategories.
   */
  fromDataSingle(categoryData: CategoryData): Category {
    if (categoryData) {
      const categoryPath = this.mapCategoryPath(categoryData.categoryPath);
      const uniqueId = categoryPath[categoryPath.length - 1];

      return {
        uniqueId,
        categoryPath,
        name: categoryData.name,
        hasOnlineProducts: categoryData.hasOnlineProducts,
        description: categoryData.description,
        images: this.imageMapper.fromImages(categoryData.images),
        completenessLevel: this.computeCompleteness(categoryData),
      };
    } else {
      throw new Error(`'categoryData' is required`);
    }
  }

  /**
   * Converts the tree of {@link CategoryData} to the model entity {@link CategoryTree}.
   * Inserts all sub categories accordingly.
   */
  fromData(categoryData: CategoryData): CategoryTree {
    if (categoryData) {
      // recurse into tree
      let subTrees: CategoryTree;
      if (categoryData.subCategories && categoryData.subCategories.length) {
        subTrees = categoryData.subCategories
          .map(c => this.fromData(c) as CategoryTree)
          .reduce((a, b) => CategoryTreeHelper.merge(a, b));
      } else {
        subTrees = CategoryTreeHelper.empty();
      }

      // create tree from current category
      const rootCat = this.fromDataSingle(categoryData);
      const tree = CategoryTreeHelper.single(rootCat);

      // create tree from categoryPath stubs
      const categoryPathTree = this.categoriesFromCategoryPath(categoryData.categoryPath);

      // merge sub categories onto current tree
      const treeWithSubCategories = CategoryTreeHelper.merge(tree, subTrees);

      // merge categoryPath stubs onto current tree
      return CategoryTreeHelper.merge(treeWithSubCategories, categoryPathTree);
    } else {
      throw new Error(`'categoryData' is required`);
    }
  }
}