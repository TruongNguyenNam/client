<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { ProductService } from '../../../../service/ProductServiceLegacy';
import type { ProductResponse, ProductApiResponse } from '../../../../model/product';
import { RouterLink } from 'vue-router';

const listProduct = ref<ProductResponse[]>([]);
const loading = ref(false);
const filters = ref({
    global: { value: undefined, matchMode: 'contains' },
});
const currentPage = ref(0); // Sử dụng 0-based index
const pageSize = ref(5);
const totalRecords = ref(0);
const selectedProducts = ref<ProductResponse[]>([]);

// Filter Refs
const sportTypeFilter = ref<string>();
const supplierFilter = ref<string>();
const categoryFilter = ref<string>();
const minPrice = ref<number>();
const maxPrice = ref<number>();

// Fetch data
onMounted(async () => {
    await fetchData();
});

// Watchers
watch(() => [
    filters.value.global.value,
    sportTypeFilter.value,
    supplierFilter.value,
    categoryFilter.value,
    minPrice.value,
    maxPrice.value
], async () => {
    currentPage.value = 0;
    await fetchData();
}, { deep: true });

watch(pageSize, async () => {
    currentPage.value = 0;
    await fetchData();
});

const changePage = (event: any) => {
    currentPage.value = event.page;
    fetchData();
};

const onFirst = () => {
    currentPage.value = 0;
    fetchData();
};

const onPrev = () => {
    if (currentPage.value > 0) {
        currentPage.value--;
        fetchData();
    }
};

const onNext = () => {
    const totalPages = Math.ceil(totalRecords.value / pageSize.value);
    if (currentPage.value < totalPages - 1) {
        currentPage.value++;
        fetchData();
    }
};

const onLast = () => {
    const totalPages = Math.ceil(totalRecords.value / pageSize.value);
    currentPage.value = totalPages - 1;
    fetchData();
};

// Data Fetching
const fetchData = async () => {
    loading.value = true;
    try {
        const response: ProductApiResponse = await ProductService.searchProducts(
            currentPage.value,
            pageSize.value,
            {
                name: filters.value.global.value,
                sportType: sportTypeFilter.value,
                supplierName: supplierFilter.value,
                categoryName: categoryFilter.value,
                minPrice: minPrice.value,
                maxPrice: maxPrice.value
            }
        );
        
        totalRecords.value = response.totalItems;
        listProduct.value = response.content;

        // Auto-correct page number
        const totalPages = Math.ceil(response.totalItems / pageSize.value);
        if (currentPage.value >= totalPages && totalPages > 0) {
            currentPage.value = totalPages - 1;
            await fetchData();
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        listProduct.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};

// Filter Management
const clearFilters = () => {
    filters.value.global.value = undefined;
    sportTypeFilter.value = undefined;
    supplierFilter.value = undefined;
    categoryFilter.value = undefined;
    minPrice.value = undefined;
    maxPrice.value = undefined;
};

const deleteSelectedProducts = async () => {
    try {
        const selectedIds = selectedProducts.value.map(product => product.id);
        await ProductService.deleteProducts(selectedIds);
        await fetchData();
        selectedProducts.value = [];
    } catch (error) {
        console.error("Error deleting products:", error);
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Products Management</h5>
                
                <!-- Toolbar Section -->
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <RouterLink to="/productadd">
                                <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" />
                            </RouterLink>
                            <Button label="Delete" 
                                    icon="pi pi-trash" 
                                    class="p-button-danger" 
                                    :disabled="!selectedProducts.length"
                                    @click="deleteSelectedProducts" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" 
                                  accept="image/*" 
                                  :maxFileSize="1000000" 
                                  label="Import" 
                                  chooseLabel="Import" 
                                  class="mr-2 inline-block" />
                        <Button label="Export" 
                              icon="pi pi-upload" 
                              class="p-button-help" />
                    </template>
                </Toolbar>

                <!-- Filter Section -->
                <div class="filter-section mb-4 p-fluid">
                    <div class="grid">
                        <div class="col-12 md:col-3">
                            <InputText v-model="filters.global.value" 
                                     placeholder="Search by name" />
                        </div>
                    </div>
                    <div class="mt-3 flex justify-content-end">
                        <Button label="Clear Filters" 
                              icon="pi pi-filter-slash" 
                              class="p-button-outlined"
                              @click="clearFilters" />
                    </div>
                </div>

                <!-- Data Table -->
                <DataTable
                    v-model:selection="selectedProducts"
                    :value="listProduct"
                    :paginator="true"
                    class="p-datatable-gridlines"
                    :totalRecords="totalRecords"
                    dataKey="id"
                    :rowHover="true"
                    :loading="loading"
                    responsiveLayout="scroll"
                    @page="changePage"
                    :first="currentPage * pageSize"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    :rowsPerPageOptions="[5,10,20,50]"
                    v-model:rows="pageSize"
                >
                    <template #header>
                        <div class="flex justify-content-between align-items-center">
                            <span class="text-xl font-semibold">Product List</span>
                            <ProgressSpinner v-if="loading" 
                                           style="width: 30px; height: 30px" />
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                    <Column field="name" header="Name" sortable style="min-width: 200px">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <img :src="data.imageUrl?.[0]" 
                                   :alt="data.name" 
                                   class="product-image"
                                   v-if="data.imageUrl?.length > 0" />
                                <span>{{ data.name }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="price" header="Price" sortable style="min-width: 120px">
                        <template #body="{ data }">
                            {{ data.price?.toLocaleString() }}
                        </template>
                    </Column>

                    <Column field="stockQuantity" header="Stock" sortable style="min-width: 120px">
                        <template #body="{ data }">
                            <Tag :severity="data.stockQuantity > 10 ? 'success' : 'danger'">
                                {{ data.stockQuantity }}
                            </Tag>
                        </template>
                    </Column>

                    <Column field="categoryName" header="Category" sortable style="min-width: 150px" />
                    <Column field="supplierName" header="Supplier" sortable style="min-width: 150px" />
                    <Column field="sportType" header="Sport Type" sortable style="min-width: 150px" />

                    <Column header="Actions" style="min-width: 150px">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <RouterLink :to="`/productupdate/${data.id}`">
                                    <Button icon="pi pi-pencil" 
                                          class="p-button-rounded p-button-success" 
                                          v-tooltip.top="'Edit'" />
                                </RouterLink>
                                <Button icon="pi pi-trash" 
                                      class="p-button-rounded p-button-danger"
                                      @click="deleteSelectedProducts" 
                                      v-tooltip.top="'Delete'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!-- Custom Pagination Controls -->
                <div class="pagination-controls mt-5" v-if="totalRecords > 0">
                    <div class="flex justify-content-center align-items-center gap-3">
                        <Button icon="pi pi-angle-double-left" 
                              @click="onFirst" 
                              :disabled="currentPage === 0"
                              class="p-button-rounded p-button-text" />
                        
                        <Button icon="pi pi-angle-left" 
                              @click="onPrev" 
                              :disabled="currentPage === 0"
                              class="p-button-rounded p-button-text" />
                        
                        <span class="current-page font-medium">{{ currentPage + 1 }}</span>
                        
                        <Button icon="pi pi-angle-right" 
                              @click="onNext" 
                              :disabled="currentPage >= Math.ceil(totalRecords / pageSize) - 1"
                              class="p-button-rounded p-button-text" />
                        
                        <Button icon="pi pi-angle-double-right" 
                              @click="onLast" 
                              :disabled="currentPage >= Math.ceil(totalRecords / pageSize) - 1"
                              class="p-button-rounded p-button-text" />
                        
                        <span class="showing-records text-color-secondary">
                            Showing {{ (currentPage * pageSize) + 1 }} - 
                            {{ Math.min((currentPage + 1) * pageSize, totalRecords) }} of 
                            {{ totalRecords }}
                        </span>
                        
                        <Dropdown v-model="pageSize" 
                                :options="[5, 10, 20, 50]" 
                                class="page-size-dropdown w-10rem" 
                                @change="fetchData" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.product-image {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 1rem;
    transition: transform 0.2s ease;
    
    &:hover {
        transform: scale(1.1);
    }
}

.pagination-controls {
    .p-button {
        min-width: 2.5rem;
        height: 2.5rem;
        border-radius: 50% !important;
        
        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
    
    .current-page {
        min-width: 40px;
        text-align: center;
        padding: 0 1rem;
        font-size: 1.1rem;
    }
    
    .showing-records {
        font-size: 0.9rem;
        margin-left: 1.5rem;
        color: var(--text-color-secondary);
    }
}

::v-deep(.p-datatable) {
    .p-paginator-bottom {
        border: none;
        background: transparent;
    }
}
</style>