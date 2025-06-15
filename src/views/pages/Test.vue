<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2"  />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger"  />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help"  />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="listProduct"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="1"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Products</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <!-- Selection Column -->
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                    <!-- ID Column -->
                    <Column field="id" header="ID" :sortable="true" headerStyle="width: 10%; min-width: 10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">ID</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column>

                    <!-- Name Column -->
                    <Column field="name" header="Name" :sortable="true" headerStyle="width: 14%; min-width: 10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>

                    <!-- Category Column -->
                    <Column field="categoryName" header="Category" :sortable="true" headerStyle="width: 14%; min-width: 10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.categoryName }}
                        </template>
                    </Column>

                    <!-- Price Column -->
                    <Column field="price" header="Price" :sortable="true" headerStyle="width: 14%; min-width: 8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>
                            {{ slotProps.data.price }}
                        </template>
                    </Column>

                    <!-- Stock Quantity Column -->
                    <Column field="stockQuantity" header="Stock Quantity" :sortable="true" headerStyle="width: 14%; min-width: 8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Stock Quantity</span>
                            {{ slotProps.data.stockQuantity }}
                        </template>
                    </Column>

                    <!-- Supplier Column -->
                    <Column field="supplierName" header="Supplier" :sortable="true" headerStyle="width: 14%; min-width: 8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Supplier</span>
                            {{ slotProps.data.supplierName }}
                        </template>
                    </Column>

                    <!-- Tag Name Column -->
                    <Column field="tagName" header="Tags" :sortable="true" headerStyle="width: 14%; min-width: 8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Tags</span>
                            <span v-for="(tag, index) in slotProps.data.tagName" :key="index">{{ tag }}<span v-if="index < slotProps.data.tagName.length - 1">, </span></span>
                        </template>
                    </Column>

                    <!-- Image URL Column -->
                    <Column field="imageUrl" header="Image" :sortable="true" headerStyle="width: 14%; min-width: 10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="slotProps.data.imageUrl[0]" alt="Product Image" width="50" />
                        </template>
                    </Column>

                    <!-- Product Attributes Column -->
                    <Column header="Attributes" headerStyle="width: 14%; min-width: 10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Attributes</span>
                            <div v-for="attribute in slotProps.data.productAttributeValueResponses" :key="attribute.id">
                                {{ attribute.attributeName }}: {{ attribute.value }}
                            </div>
                        </template>
                    </Column>

                    <!-- Inventories Column -->
                    <Column header="Inventories" headerStyle="width: 14%; min-width: 10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Inventories</span>
                            <div v-for="inventory in slotProps.data.inventories" :key="inventory.id">
                                {{ inventory.productName }}: {{ inventory.stockQuantity }}
                            </div>
                        </template>
                    </Column>

                    <!-- Action Column (Edit & Delete) -->
                    <Column headerStyle="min-width: 10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"  />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2"  />
                        </template>
                    </Column>
                </DataTable>

                <!-- Dialogs for editing, confirming delete -->
                <!-- Your existing Dialog code -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { ProductResponse } from '../../model/admin/product';
import { ProductService } from '../../service/admin/ProductServiceLegacy';

const listProduct = ref<ProductResponse[]>([]);
const selectedProducts = ref<any[]>([]); // To manage selection of products
const filters = ref<any>({ global: { value: '' } });

const fetchData = async () => {
    try {
        listProduct.value = await ProductService.getAllParentProducts();
        console.log(listProduct.value);
    } catch (error) {
        console.log(error);
    }
};

onMounted(fetchData);
</script>


 id: 0,
name: '',
description: '',
price: null,
stockQuantity: null,
sportType: '',
sku: '',
supplierName: '',
categoryName: '',
productAttributeValueResponses: [],
tagName: [],
imageUrl: [], 
inventories: [] 