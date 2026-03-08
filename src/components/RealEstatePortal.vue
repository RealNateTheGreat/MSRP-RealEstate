<template>
  <div class="portal-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-text" v-if="!sidebarCollapsed">MSRP Real Estate</span>
          <span class="logo-icon" v-else>M</span>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a
          v-for="item in navItems"
          :key="item.id"
          :class="['nav-item', { active: activeTab === item.id }]"
          @click="activeTab = item.id"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label" v-if="!sidebarCollapsed">{{ item.label }}</span>
          <span class="nav-badge" v-if="item.badge && !sidebarCollapsed">{{ item.badge }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile" v-if="!sidebarCollapsed">
          <div class="user-avatar">
            <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100" alt="User">
            <span class="status-indicator"></span>
          </div>
          <div class="user-info">
            <div class="user-name">John Doe</div>
            <div class="user-role">Real Estate Agent</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Top Navigation Bar -->
      <header class="top-nav">
        <div class="breadcrumb">
          <span class="breadcrumb-item">Home</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item active">{{ currentTabLabel }}</span>
        </div>

        <div class="top-nav-actions">
          <button class="icon-button" @click="showNotifications = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            <span class="notification-dot"></span>
          </button>
          <button class="icon-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Content Sections -->
      <div class="content-wrapper">
        <!-- Dashboard Tab -->
        <section v-if="activeTab === 'dashboard'" class="content-section">
          <h1 class="section-title">Dashboard</h1>
          <p class="section-description">Welcome back! Here's your economy overview and recent activity.</p>

          <!-- Economy Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card glow-card" v-for="stat in economyStats" :key="stat.label">
              <div class="stat-icon" :style="{ background: stat.color }">
                <span v-html="stat.icon"></span>
              </div>
              <div class="stat-content">
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-change" :class="stat.trend">{{ stat.change }}</div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="activity-section">
            <h2 class="subsection-title">Recent Activity</h2>
            <div class="activity-list">
              <div class="activity-item" v-for="activity in recentActivity" :key="activity.id">
                <div class="activity-icon" :style="{ background: activity.color }">
                  <span v-html="activity.icon"></span>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
                <div class="activity-amount" :class="activity.type">{{ activity.amount }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Marketplace Tab -->
        <section v-if="activeTab === 'marketplace'" class="content-section">
          <div class="section-header">
            <div>
              <h1 class="section-title">Property Marketplace</h1>
              <p class="section-description">Browse available properties and submit purchase requests.</p>
            </div>
            <div class="section-actions">
              <div class="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input type="text" placeholder="Search properties..." v-model="searchQuery">
              </div>
              <button class="filter-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                </svg>
                Filters
              </button>
            </div>
          </div>

          <!-- Property Grid -->
          <div class="property-grid">
            <div class="property-card" v-for="property in filteredProperties" :key="property.id" @click="openPropertyModal(property)">
              <div class="property-image">
                <img :src="property.image" :alt="property.title">
                <div class="property-badge">{{ property.district }}</div>
                <button class="property-favorite" @click.stop="toggleFavorite(property.id)">
                  <svg width="20" height="20" viewBox="0 0 24 24" :fill="property.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
              <div class="property-content">
                <h3 class="property-title">{{ property.title }}</h3>
                <p class="property-description">{{ property.description }}</p>
                <div class="property-footer">
                  <div class="property-price">${{ property.price.toLocaleString() }}</div>
                  <button class="property-action" @click.stop="requestToBuy(property)">
                    Request to Buy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Properties Tab -->
        <section v-if="activeTab === 'properties'" class="content-section">
          <h1 class="section-title">My Properties</h1>
          <p class="section-description">Manage your owned properties and view active requests.</p>

          <div class="owned-properties">
            <div class="owned-property-card" v-for="property in ownedProperties" :key="property.id">
              <div class="owned-property-header">
                <img :src="property.image" alt="" class="owned-property-thumbnail">
                <div class="owned-property-info">
                  <h3>{{ property.title }}</h3>
                  <p class="property-district-tag">{{ property.district }}</p>
                </div>
                <button class="settings-button" @click="openSettingsModal(property)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                  </svg>
                </button>
              </div>
              <div class="owned-property-stats">
                <div class="stat">
                  <span class="stat-label">Purchase Price</span>
                  <span class="stat-value">${{ property.purchasePrice.toLocaleString() }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Owned Since</span>
                  <span class="stat-value">{{ property.ownedSince }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Active Requests</span>
                  <span class="stat-value highlight">{{ property.activeRequests }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Management Tab -->
        <section v-if="activeTab === 'management'" class="content-section">
          <h1 class="section-title">Management Panel</h1>
          <p class="section-description">Administrative controls for listings, requests, and economy management.</p>

          <div class="management-tabs">
            <button
              v-for="tab in managementTabs"
              :key="tab.id"
              :class="['management-tab', { active: activeManagementTab === tab.id }]"
              @click="activeManagementTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="management-content">
            <div v-if="activeManagementTab === 'listings'" class="management-panel">
              <div class="panel-header">
                <h2>Listings Administration</h2>
                <button class="primary-button" @click="showCreateListingModal = true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Create New Listing
                </button>
              </div>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>District</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="listing in allListings" :key="listing.id">
                      <td>
                        <div class="table-property">
                          <img :src="listing.image" alt="">
                          <span>{{ listing.title }}</span>
                        </div>
                      </td>
                      <td>{{ listing.district }}</td>
                      <td>${{ listing.price.toLocaleString() }}</td>
                      <td><span :class="['status-badge', listing.status]">{{ listing.status }}</span></td>
                      <td>
                        <button class="table-action-btn">Edit</button>
                        <button class="table-action-btn danger">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="activeManagementTab === 'requests'" class="management-panel">
              <h2>Active Purchase Requests</h2>
              <div class="requests-list">
                <div class="request-card" v-for="request in purchaseRequests" :key="request.id">
                  <div class="request-header">
                    <div class="request-user">
                      <img :src="request.userAvatar" alt="" class="request-avatar">
                      <div>
                        <div class="request-username">{{ request.username }}</div>
                        <div class="request-time">{{ request.time }}</div>
                      </div>
                    </div>
                    <span :class="['status-badge', request.status]">{{ request.status }}</span>
                  </div>
                  <div class="request-details">
                    <div class="request-property">
                      <strong>Property:</strong> {{ request.propertyTitle }}
                    </div>
                    <div class="request-amount">
                      <strong>Offer:</strong> ${{ request.amount.toLocaleString() }}
                    </div>
                  </div>
                  <div class="request-actions">
                    <button class="approve-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Approve
                    </button>
                    <button class="deny-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Property Detail Modal -->
    <transition name="modal">
      <div v-if="selectedProperty" class="modal-overlay" @click="closePropertyModal">
        <div class="modal-container property-modal" @click.stop>
          <button class="modal-close" @click="closePropertyModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          <div class="modal-image">
            <img :src="selectedProperty.image" :alt="selectedProperty.title">
          </div>

          <div class="modal-content">
            <div class="modal-header">
              <h2>{{ selectedProperty.title }}</h2>
              <span class="modal-badge">{{ selectedProperty.district }}</span>
            </div>

            <p class="modal-description">{{ selectedProperty.description }}</p>

            <div class="modal-details">
              <div class="detail-item">
                <span class="detail-label">Price</span>
                <span class="detail-value">${{ selectedProperty.price.toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">District</span>
                <span class="detail-value">{{ selectedProperty.district }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">{{ selectedProperty.type || 'Residential' }}</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="secondary-button" @click="closePropertyModal">Cancel</button>
              <button class="primary-button" @click="requestToBuy(selectedProperty)">
                Request to Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Settings Modal -->
    <transition name="modal">
      <div v-if="selectedPropertySettings" class="modal-overlay" @click="closeSettingsModal">
        <div class="modal-container settings-modal" @click.stop>
          <button class="modal-close" @click="closeSettingsModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          <h2 class="modal-title">Property Settings</h2>

          <div class="settings-sections">
            <div class="settings-section">
              <h3>Relist Property</h3>
              <div class="form-group">
                <label>New Sale Price</label>
                <input type="number" placeholder="Enter new price" class="form-input">
              </div>
              <div class="form-group">
                <label>Reason for Relisting</label>
                <textarea placeholder="Optional reason..." class="form-textarea"></textarea>
              </div>
              <button class="primary-button">Relist Property</button>
            </div>

            <div class="settings-section">
              <h3>Active Buyer Requests</h3>
              <div class="mini-requests-list">
                <div class="mini-request" v-for="i in 2" :key="i">
                  <div class="mini-request-user">
                    <img src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100" alt="">
                    <div>
                      <div class="mini-request-name">Buyer Name {{ i }}</div>
                      <div class="mini-request-time">2 hours ago</div>
                    </div>
                  </div>
                  <div class="mini-request-actions">
                    <button class="mini-approve">✓</button>
                    <button class="mini-deny">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-section danger-zone">
              <h3>Danger Zone</h3>
              <button class="danger-button">Revoke Ownership</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Create Listing Modal -->
    <transition name="modal">
      <div v-if="showCreateListingModal" class="modal-overlay" @click="showCreateListingModal = false">
        <div class="modal-container create-modal" @click.stop>
          <button class="modal-close" @click="showCreateListingModal = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          <h2 class="modal-title">Create New Listing</h2>

          <form class="create-form">
            <div class="form-row">
              <div class="form-group">
                <label>Property Title</label>
                <input type="text" placeholder="Modern Downtown Apartment" class="form-input">
              </div>
              <div class="form-group">
                <label>District</label>
                <select class="form-input">
                  <option>Downtown</option>
                  <option>Suburbs</option>
                  <option>Industrial</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Price</label>
                <input type="number" placeholder="50000" class="form-input">
              </div>
              <div class="form-group">
                <label>Property Type</label>
                <select class="form-input">
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Industrial</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea placeholder="Enter property description..." class="form-textarea" rows="4"></textarea>
            </div>

            <div class="form-group">
              <label>Property Image</label>
              <div class="file-upload">
                <input type="file" id="file-upload" hidden>
                <label for="file-upload" class="file-upload-label">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Choose Image
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="secondary-button" @click="showCreateListingModal = false">Cancel</button>
              <button type="submit" class="primary-button">Create Listing</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Toast Notifications -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click="removeToast(toast.id)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Property {
  id: number
  title: string
  description: string
  price: number
  district: string
  image: string
  favorite: boolean
  type?: string
}

interface OwnedProperty {
  id: number
  title: string
  district: string
  image: string
  purchasePrice: number
  ownedSince: string
  activeRequests: number
}

interface Toast {
  id: number
  title: string
  message: string
  type: 'success' | 'error'
}

const sidebarCollapsed = ref(false)
const activeTab = ref('dashboard')
const activeManagementTab = ref('listings')
const searchQuery = ref('')
const selectedProperty = ref<Property | null>(null)
const selectedPropertySettings = ref<OwnedProperty | null>(null)
const showCreateListingModal = ref(false)
const showNotifications = ref(false)
const toasts = ref<Toast[]>([])

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>' },
  { id: 'marketplace', label: 'Marketplace', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>' },
  { id: 'properties', label: 'My Properties', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>', badge: '3' },
  { id: 'management', label: 'Management', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-5.5 9h11z M12 22l5.5-9h-11z M2 17h8v-2H2v2zm0-4h8v-2H2v2z M22 13h-8v2h8v-2zm0 4h-8v2h8v-2z"/></svg>' },
]

const managementTabs = [
  { id: 'listings', label: 'Listings Admin' },
  { id: 'requests', label: 'Active Requests' },
  { id: 'economy', label: 'Economy Admin' },
]

const economyStats = [
  {
    label: 'Cash Balance',
    value: '$45,230',
    change: '+12.5%',
    trend: 'positive',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>'
  },
  {
    label: 'Bank Balance',
    value: '$128,500',
    change: '+8.2%',
    trend: 'positive',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M11.5 1L2 6v2h19V6m-5 4v7h3v-7M2 22h19v-3H2m8-9v7h3v-7m-9 0v7h3v-7H4z"/></svg>'
  },
  {
    label: 'Total Worth',
    value: '$173,730',
    change: '+15.8%',
    trend: 'positive',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>'
  },
  {
    label: 'Properties Owned',
    value: '3',
    change: '+1 this month',
    trend: 'neutral',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
  },
]

const recentActivity = [
  {
    id: 1,
    title: 'Purchase Request Approved',
    time: '2 hours ago',
    amount: '+$50,000',
    type: 'positive',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
  },
  {
    id: 2,
    title: 'Property Listed',
    time: '5 hours ago',
    amount: 'Downtown Loft',
    type: 'neutral',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2l-5.5 9h11z"/></svg>'
  },
  {
    id: 3,
    title: 'Bank Deposit',
    time: '1 day ago',
    amount: '+$25,000',
    type: 'positive',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M11.5 1L2 6v2h19V6m-5 4v7h3v-7M2 22h19v-3H2m8-9v7h3v-7m-9 0v7h3v-7H4z"/></svg>'
  },
]

const properties = ref([
  {
    id: 1,
    title: 'Luxury Downtown Penthouse',
    description: 'Stunning modern penthouse in the heart of downtown with panoramic city views.',
    price: 125000,
    district: 'Downtown',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
    favorite: false,
    type: 'Residential'
  },
  {
    id: 2,
    title: 'Cozy Suburban Home',
    description: 'Beautiful family home in quiet suburban neighborhood with large backyard.',
    price: 75000,
    district: 'Suburbs',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    favorite: false,
    type: 'Residential'
  },
  {
    id: 3,
    title: 'Modern Office Space',
    description: 'Prime commercial space perfect for startups and small businesses.',
    price: 200000,
    district: 'Business District',
    image: 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=800',
    favorite: false,
    type: 'Commercial'
  },
  {
    id: 4,
    title: 'Beachfront Villa',
    description: 'Exclusive beachfront property with private access to the shore.',
    price: 350000,
    district: 'Coastal',
    image: 'https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?auto=compress&cs=tinysrgb&w=800',
    favorite: true,
    type: 'Luxury'
  },
  {
    id: 5,
    title: 'Industrial Warehouse',
    description: 'Spacious warehouse facility with modern loading docks and storage.',
    price: 180000,
    district: 'Industrial',
    image: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=800',
    favorite: false,
    type: 'Industrial'
  },
  {
    id: 6,
    title: 'Mountain Retreat',
    description: 'Secluded mountain cabin perfect for weekend getaways.',
    price: 95000,
    district: 'Mountains',
    image: 'https://images.pexels.com/photos/2227832/pexels-photo-2227832.jpeg?auto=compress&cs=tinysrgb&w=800',
    favorite: false,
    type: 'Residential'
  },
])

const ownedProperties = [
  {
    id: 1,
    title: 'Downtown Apartment',
    district: 'Downtown',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=200',
    purchasePrice: 85000,
    ownedSince: 'Jan 15, 2024',
    activeRequests: 2
  },
  {
    id: 2,
    title: 'Suburban House',
    district: 'Suburbs',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200',
    purchasePrice: 65000,
    ownedSince: 'Dec 3, 2023',
    activeRequests: 0
  },
  {
    id: 3,
    title: 'Commercial Space',
    district: 'Business District',
    image: 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=200',
    purchasePrice: 150000,
    ownedSince: 'Feb 20, 2024',
    activeRequests: 1
  },
]

const allListings = properties.value.map(p => ({ ...p, status: Math.random() > 0.5 ? 'available' : 'pending' }))

const purchaseRequests = [
  {
    id: 1,
    username: 'JohnDoe#1234',
    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    propertyTitle: 'Luxury Downtown Penthouse',
    amount: 125000,
    time: '2 hours ago',
    status: 'pending'
  },
  {
    id: 2,
    username: 'JaneSmith#5678',
    userAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100',
    propertyTitle: 'Cozy Suburban Home',
    amount: 75000,
    time: '5 hours ago',
    status: 'pending'
  },
]

const currentTabLabel = computed(() => {
  return navItems.find(item => item.id === activeTab.value)?.label || 'Dashboard'
})

const filteredProperties = computed(() => {
  if (!searchQuery.value) return properties.value
  return properties.value.filter(p =>
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.district.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function openPropertyModal(property: any) {
  selectedProperty.value = property
}

function closePropertyModal() {
  selectedProperty.value = null
}

function openSettingsModal(property: any) {
  selectedPropertySettings.value = property
}

function closeSettingsModal() {
  selectedPropertySettings.value = null
}

function toggleFavorite(id: number) {
  const property = properties.value.find(p => p.id === id)
  if (property) {
    property.favorite = !property.favorite
  }
}

function requestToBuy(property: any) {
  showToast('Request Submitted', `Your purchase request for ${property.title} has been submitted.`, 'success')
  closePropertyModal()
}

function showToast(title: string, message: string, type: 'success' | 'error' = 'success') {
  const id = Date.now()
  toasts.value.push({ id, title, message, type })
  setTimeout(() => removeToast(id), 5000)
}

function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.portal-container {
  display: flex;
  min-height: 100vh;
  background: #1e1f22;
  color: #f2f3f5;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: #2b2d31;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 100;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #5865f2 0%, #7289da 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  font-size: 24px;
  font-weight: 800;
  color: #5865f2;
}

.collapse-btn {
  background: transparent;
  border: none;
  color: #b5bac1;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f2f3f5;
}

.sidebar-nav {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #b5bac1;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: #5865f2;
  transform: scaleY(0);
  transition: transform 0.2s;
}

.nav-item:hover {
  background: rgba(88, 101, 242, 0.1);
  color: #f2f3f5;
}

.nav-item:hover::before {
  transform: scaleY(1);
}

.nav-item.active {
  background: rgba(88, 101, 242, 0.15);
  color: #fff;
  box-shadow: 0 0 20px rgba(88, 101, 242, 0.3);
}

.nav-item.active::before {
  transform: scaleY(1);
}

.nav-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
}

.nav-badge {
  background: #5865f2;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.sidebar.collapsed .nav-label,
.sidebar.collapsed .nav-badge {
  display: none;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s;
  cursor: pointer;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.06);
}

.user-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #23a559;
  border: 2px solid #2b2d31;
  border-radius: 50%;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #f2f3f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #b5bac1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-nav {
  background: #2b2d31;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #b5bac1;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #f2f3f5;
}

.breadcrumb-item.active {
  color: #f2f3f5;
  font-weight: 600;
}

.breadcrumb-separator {
  color: #4e5058;
}

.top-nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-button {
  position: relative;
  background: transparent;
  border: none;
  color: #b5bac1;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f2f3f5;
  transform: translateY(-2px);
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #f23f43;
  border-radius: 50%;
  border: 2px solid #2b2d31;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

.content-section {
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #f2f3f5;
}

.section-description {
  font-size: 16px;
  color: #b5bac1;
  margin: 0 0 32px 0;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1e1f22;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 16px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #5865f2;
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
}

.search-box svg {
  color: #b5bac1;
  flex-shrink: 0;
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #f2f3f5;
  font-size: 14px;
  width: 250px;
}

.search-box input::placeholder {
  color: #4e5058;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1e1f22;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f2f3f5;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.filter-button:hover {
  background: rgba(88, 101, 242, 0.1);
  border-color: #5865f2;
  transform: translateY(-2px);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: #2b2d31;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(88, 101, 242, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-color: rgba(88, 101, 242, 0.3);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.stat-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 14px;
  color: #b5bac1;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #f2f3f5;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 13px;
  font-weight: 600;
}

.stat-change.positive {
  color: #23a559;
}

.stat-change.negative {
  color: #f23f43;
}

.stat-change.neutral {
  color: #b5bac1;
}

/* Activity Section */
.activity-section {
  background: #2b2d31;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
}

.subsection-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #f2f3f5;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #1e1f22;
  border-radius: 8px;
  transition: all 0.2s;
}

.activity-item:hover {
  background: rgba(88, 101, 242, 0.05);
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 15px;
  font-weight: 500;
  color: #f2f3f5;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 13px;
  color: #b5bac1;
}

.activity-amount {
  font-size: 15px;
  font-weight: 600;
}

.activity-amount.positive {
  color: #23a559;
}

.activity-amount.neutral {
  color: #b5bac1;
}

/* Property Grid */
.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.property-card {
  background: #2b2d31;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.property-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(88, 101, 242, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 1;
}

.property-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(88, 101, 242, 0.3);
  border-color: rgba(88, 101, 242, 0.3);
}

.property-card:hover::before {
  opacity: 1;
}

.property-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.property-card:hover .property-image img {
  transform: scale(1.1);
}

.property-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
}

.property-favorite {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
}

.property-favorite:hover {
  background: rgba(242, 63, 67, 0.9);
  transform: scale(1.1);
}

.property-content {
  padding: 20px;
  position: relative;
  z-index: 2;
}

.property-title {
  font-size: 18px;
  font-weight: 600;
  color: #f2f3f5;
  margin: 0 0 8px 0;
}

.property-description {
  font-size: 14px;
  color: #b5bac1;
  margin: 0 0 16px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.property-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.property-price {
  font-size: 22px;
  font-weight: 700;
  color: #f2f3f5;
}

.property-action {
  background: #5865f2;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.property-action:hover {
  background: #4752c4;
  box-shadow: 0 4px 16px rgba(88, 101, 242, 0.4);
  transform: translateY(-2px);
}

/* Owned Properties */
.owned-properties {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.owned-property-card {
  background: #2b2d31;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s;
}

.owned-property-card:hover {
  border-color: rgba(88, 101, 242, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.owned-property-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.owned-property-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.owned-property-info {
  flex: 1;
}

.owned-property-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #f2f3f5;
  margin: 0 0 8px 0;
}

.property-district-tag {
  display: inline-block;
  background: rgba(88, 101, 242, 0.15);
  color: #5865f2;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin: 0;
}

.settings-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #b5bac1;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-button:hover {
  background: rgba(88, 101, 242, 0.15);
  border-color: #5865f2;
  color: #f2f3f5;
  transform: rotate(90deg);
}

.owned-property-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #b5bac1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #f2f3f5;
}

.stat-value.highlight {
  color: #5865f2;
}

/* Management Panel */
.management-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.06);
}

.management-tab {
  background: transparent;
  border: none;
  color: #b5bac1;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  position: relative;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.management-tab:hover {
  color: #f2f3f5;
  background: rgba(255, 255, 255, 0.03);
}

.management-tab.active {
  color: #5865f2;
  border-bottom-color: #5865f2;
}

.management-content {
  min-height: 400px;
}

.management-panel {
  background: #2b2d31;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.panel-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #f2f3f5;
  margin: 0;
}

.primary-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #5865f2;
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button:hover {
  background: #4752c4;
  box-shadow: 0 4px 16px rgba(88, 101, 242, 0.4);
  transform: translateY(-2px);
}

.secondary-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f2f3f5;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Data Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #1e1f22;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #b5bac1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 14px;
  color: #f2f3f5;
}

.table-property {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-property img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.available {
  background: rgba(35, 165, 89, 0.15);
  color: #23a559;
}

.status-badge.pending {
  background: rgba(250, 166, 26, 0.15);
  color: #faa61a;
}

.table-action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f2f3f5;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 8px;
}

.table-action-btn:hover {
  background: rgba(88, 101, 242, 0.15);
  border-color: #5865f2;
}

.table-action-btn.danger:hover {
  background: rgba(242, 63, 67, 0.15);
  border-color: #f23f43;
  color: #f23f43;
}

/* Requests List */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  background: #1e1f22;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
}

.request-card:hover {
  border-color: rgba(88, 101, 242, 0.3);
  transform: translateX(4px);
}

.request-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.request-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.request-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.request-username {
  font-size: 15px;
  font-weight: 600;
  color: #f2f3f5;
}

.request-time {
  font-size: 13px;
  color: #b5bac1;
}

.request-details {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
}

.request-property,
.request-amount {
  font-size: 14px;
  color: #b5bac1;
  margin-bottom: 8px;
}

.request-property strong,
.request-amount strong {
  color: #f2f3f5;
  margin-right: 8px;
}

.request-actions {
  display: flex;
  gap: 12px;
}

.approve-button,
.deny-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.approve-button {
  background: rgba(35, 165, 89, 0.15);
  color: #23a559;
}

.approve-button:hover {
  background: #23a559;
  color: white;
  transform: translateY(-2px);
}

.deny-button {
  background: rgba(242, 63, 67, 0.15);
  color: #f23f43;
}

.deny-button:hover {
  background: #f23f43;
  color: white;
  transform: translateY(-2px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: #2b2d31;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #b5bac1;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(242, 63, 67, 0.15);
  color: #f23f43;
  transform: rotate(90deg);
}

.property-modal {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.modal-image {
  height: 100%;
  overflow: hidden;
  border-radius: 16px 0 0 16px;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-content {
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.modal-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #f2f3f5;
  margin: 0;
  flex: 1;
}

.modal-badge {
  background: rgba(88, 101, 242, 0.15);
  color: #5865f2;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.modal-description {
  font-size: 15px;
  color: #b5bac1;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #1e1f22;
  border-radius: 8px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 14px;
  color: #b5bac1;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #f2f3f5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.modal-actions button {
  flex: 1;
}

/* Settings Modal */
.settings-modal {
  max-width: 600px;
  padding: 32px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #f2f3f5;
  margin: 0 0 24px 0;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  padding: 20px;
  background: #1e1f22;
  border-radius: 8px;
}

.settings-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #f2f3f5;
  margin: 0 0 16px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #b5bac1;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  background: #2b2d31;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f2f3f5;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #5865f2;
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.mini-requests-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-request {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #2b2d31;
  border-radius: 6px;
}

.mini-request-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-request-user img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.mini-request-name {
  font-size: 14px;
  font-weight: 600;
  color: #f2f3f5;
}

.mini-request-time {
  font-size: 12px;
  color: #b5bac1;
}

.mini-request-actions {
  display: flex;
  gap: 8px;
}

.mini-approve,
.mini-deny {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-approve {
  background: rgba(35, 165, 89, 0.15);
  color: #23a559;
}

.mini-approve:hover {
  background: #23a559;
  color: white;
}

.mini-deny {
  background: rgba(242, 63, 67, 0.15);
  color: #f23f43;
}

.mini-deny:hover {
  background: #f23f43;
  color: white;
}

.danger-zone {
  border: 1px solid rgba(242, 63, 67, 0.3);
  background: rgba(242, 63, 67, 0.05);
}

.danger-button {
  background: rgba(242, 63, 67, 0.15);
  border: 1px solid rgba(242, 63, 67, 0.3);
  color: #f23f43;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.danger-button:hover {
  background: #f23f43;
  color: white;
  border-color: #f23f43;
}

/* Create Modal */
.create-modal {
  max-width: 700px;
  padding: 32px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.file-upload {
  position: relative;
}

.file-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #1e1f22;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  color: #b5bac1;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 600;
}

.file-upload-label:hover {
  border-color: #5865f2;
  color: #f2f3f5;
  background: rgba(88, 101, 242, 0.05);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.form-actions button {
  flex: 1;
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2000;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #2b2d31;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 320px;
}

.toast.success {
  border-left: 3px solid #23a559;
}

.toast.error {
  border-left: 3px solid #f23f43;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast.success .toast-icon {
  color: #23a559;
}

.toast.error .toast-icon {
  color: #f23f43;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #f2f3f5;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  color: #b5bac1;
}

.toast-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #b5bac1;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #f2f3f5;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(20px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1e1f22;
}

::-webkit-scrollbar-thumb {
  background: #4e5058;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #5865f2;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .property-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
  }

  .sidebar.collapsed {
    transform: translateX(0);
  }

  .property-modal {
    grid-template-columns: 1fr;
  }

  .modal-image {
    height: 250px;
    border-radius: 16px 16px 0 0;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box input {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .content-wrapper {
    padding: 20px;
  }
}
</style>
