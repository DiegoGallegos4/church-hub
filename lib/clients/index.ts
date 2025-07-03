import { AuthClient } from './auth-client'
import { ProfileClient } from './profile-client'
import { DevotionalClient } from './devotional-client'
import { MinistryClient } from './ministry-client'
import { RotaClient } from './rota-client'
import { RotaTemplateClient } from './rota-template-client'

// Create singleton instances
const authClient = new AuthClient()
const profileClient = new ProfileClient()
const devotionalClient = new DevotionalClient()
const ministryClient = new MinistryClient()
const rotaClient = new RotaClient()
const rotaTemplateClient = new RotaTemplateClient()

// Export individual clients
export { AuthClient, ProfileClient, DevotionalClient, MinistryClient, RotaClient, RotaTemplateClient }

// Export singleton instances
export { authClient, profileClient, devotionalClient, ministryClient, rotaClient, rotaTemplateClient }

// Main client class that provides access to all domain clients
export class SupabaseClient {
  // Domain clients
  auth = authClient
  profile = profileClient
  devotional = devotionalClient
  ministry = ministryClient
  rota = rotaClient
  rotaTemplate = rotaTemplateClient

  // Convenience methods for backward compatibility
  getCurrentUser = authClient.getCurrentUser.bind(authClient)
  signInWithPassword = authClient.signInWithPassword.bind(authClient)
  signOut = authClient.signOut.bind(authClient)
  signInWithOtp = authClient.signInWithOtp.bind(authClient)

  getProfile = profileClient.getProfile.bind(profileClient)
  createProfile = profileClient.createProfile.bind(profileClient)
  updateProfile = profileClient.updateProfile.bind(profileClient)
  getAllProfiles = profileClient.getAllProfiles.bind(profileClient)
  updateProfileRole = profileClient.updateProfileRole.bind(profileClient)

  getDevotionals = devotionalClient.getDevotionals.bind(devotionalClient)
  getDevotional = devotionalClient.getDevotional.bind(devotionalClient)
  createDevotional = devotionalClient.createDevotional.bind(devotionalClient)
  createDevotionalWithIdeas = devotionalClient.createDevotionalWithIdeas.bind(devotionalClient)
  updateDevotional = devotionalClient.updateDevotional.bind(devotionalClient)
  deleteDevotional = devotionalClient.deleteDevotional.bind(devotionalClient)
  getBibleReadings = devotionalClient.getBibleReadings.bind(devotionalClient)
  createBibleReading = devotionalClient.createBibleReading.bind(devotionalClient)
  updateBibleReading = devotionalClient.updateBibleReading.bind(devotionalClient)
  deleteBibleReading = devotionalClient.deleteBibleReading.bind(devotionalClient)

  getMinistries = ministryClient.getMinistries.bind(ministryClient)
  getAllMinistries = ministryClient.getAllMinistries.bind(ministryClient)
  getMinistry = ministryClient.getMinistry.bind(ministryClient)
  createMinistry = ministryClient.createMinistry.bind(ministryClient)
  updateMinistry = ministryClient.updateMinistry.bind(ministryClient)
  deleteMinistry = ministryClient.deleteMinistry.bind(ministryClient)

  getRotaByDate = rotaClient.getRotaByDate.bind(rotaClient)
  getRotas = rotaClient.getRotas.bind(rotaClient)
  getRotaById = rotaClient.getRotaById.bind(rotaClient)
  createRota = rotaClient.createRota.bind(rotaClient)
  duplicateRota = rotaClient.duplicateRota.bind(rotaClient)
  getRotaSlots = rotaClient.getRotaSlots.bind(rotaClient)
  getRotaSlot = rotaClient.getRotaSlot.bind(rotaClient)
  createRotaSlot = rotaClient.createRotaSlot.bind(rotaClient)
  updateRotaSlot = rotaClient.updateRotaSlot.bind(rotaClient)
  deleteRotaSlot = rotaClient.deleteRotaSlot.bind(rotaClient)
  getServerAssignments = rotaClient.getServerAssignments.bind(rotaClient)
  getUserAssignments = rotaClient.getUserAssignments.bind(rotaClient)
  createServerAssignment = rotaClient.createServerAssignment.bind(rotaClient)
  updateServerAssignment = rotaClient.updateServerAssignment.bind(rotaClient)
  deleteServerAssignment = rotaClient.deleteServerAssignment.bind(rotaClient)

  // Stats method (placeholder for now)
  async getStats() {
    // This could be implemented to aggregate stats from all domains
    return {
      totalUsers: 0,
      totalDevotionals: 0,
      totalMinistries: 0,
      totalRotaSlots: 0,
      activeServers: 0
    }
  }
}

// Export the main client instance
export const supabaseClient = new SupabaseClient() 