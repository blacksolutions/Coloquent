import {FilterSpec} from "./FilterSpec";
import {ClassFilterSpec} from "./ClassFilterSpec";
import {SortSpec} from "./SortSpec";
import {Option} from "./Option";
import {PaginationSpec} from "./paginationspec/PaginationSpec";
import {QueryParam} from "./QueryParam";

export class Query
{
    protected jsonApiType: string;

    protected idToFind: number;

    protected paginationSpec: PaginationSpec;

    protected include: string[];

    protected filters: FilterSpec[];

    protected options: Option[];

    protected sort: SortSpec[];

    constructor(jsonApiType: string)
    {
        this.jsonApiType = jsonApiType;
        this.include = [];
        this.filters = [];
        this.options = [];
        this.sort = [];
    }

    protected addFilterParameters(searchParams: QueryParam[]): void
    {
        for (let f of this.filters) {
            if (f instanceof ClassFilterSpec) {
                let ff = <ClassFilterSpec> f;
                searchParams.push(new QueryParam(`filter[${ff.getClass()}][${ff.getAttribute()}]`, ff.getValue()));
            } else {
                searchParams.push(new QueryParam(`filter[${f.getAttribute()}]`, f.getValue()));
            }
        }
    }

    protected addIncludeParameters(searchParams: QueryParam[]): void
    {
        if (this.include.length > 0) {
            let p = '';
            for (let incl of this.include) {
                if (p !== '') {
                    p += ',';
                }
                p += incl;
            }
            searchParams.push(new QueryParam('include', p));
        }
    }

    protected addOptionsParameters(searchParams: QueryParam[]): void
    {
        for (let option of this.options) {
            searchParams.push(new QueryParam(option.getParameter(), option.getValue()));
        }
    }

    protected addPaginationParameters(searchParams: QueryParam[]): void
    {
        for (let param of this.paginationSpec.getPaginationParameters()) {
            searchParams.push(new QueryParam(param.name, param.value));
        }
    }

    protected addSortParameters(searchParams: QueryParam[]): void
    {
        if (this.sort.length > 0) {
            let p = '';
            for (let sortSpec of this.sort) {
                if (p !== '') {
                    p += ',';
                }
                if (!sortSpec.getPositiveDirection()) {
                    p += '-';
                }
                p += sortSpec.getAttribute();
            }
            searchParams.push(new QueryParam('sort', p));
        }
    }

    public toString(): string
    {
        let idToFind: string = this.idToFind
            ? '/' + this.idToFind
            : '';

        let searchParams: QueryParam[] = [];
        this.addFilterParameters(searchParams);
        this.addIncludeParameters(searchParams);
        this.addOptionsParameters(searchParams);
        this.addPaginationParameters(searchParams);
        this.addSortParameters(searchParams);
        let paramString = '';
        for (let searchParam of searchParams) {
            if (paramString === '') {
                paramString += '?';
            } else {
                paramString += '&';
            }
            paramString += encodeURIComponent(searchParam.name) + '=' + encodeURIComponent(searchParam.value);
        }

        return this.jsonApiType + idToFind + paramString;
    }

    public setIdToFind(idToFind: number): void
    {
        this.idToFind = idToFind;
    }

    public getPaginationSpec(): PaginationSpec
    {
        return this.paginationSpec;
    }

    public setPaginationSpec(paginationSpec: PaginationSpec): void
    {
        this.paginationSpec = paginationSpec;
    }

    public addInclude(includeSpec: string): void
    {
        this.include.push(includeSpec);
    }

    public addFilter(filter: FilterSpec): void
    {
        this.filters.push(filter);
    }

    public addSort(sort: SortSpec): void
    {
        this.sort.push(sort);
    }

    public addOption(option: Option): void
    {
        this.options.push(option);
    }
}