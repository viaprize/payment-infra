export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      extra_donation_portal_data: {
        Row: {
          donatedAt: string
          donor: string
          externalId: string
          id: number
          usdValue: number
        }
        Insert: {
          donatedAt: string
          donor: string
          externalId: string
          id?: number
          usdValue: number
        }
        Update: {
          donatedAt?: string
          donor?: string
          externalId?: string
          id?: number
          usdValue?: number
        }
        Relationships: []
      }
      extra_portal: {
        Row: {
          externalId: string
          funds: number
          id: number
        }
        Insert: {
          externalId: string
          funds: number
          id?: number
        }
        Update: {
          externalId?: string
          funds?: number
          id?: number
        }
        Relationships: []
      }
      fiat_payments: {
        Row: {
          amount_in_cents: number
          contract_address: string
          created_at: string
          id: number
          is_refund_triggered: boolean
          is_refunded: boolean
          payment_id: string
          user_address: string
        }
        Insert: {
          amount_in_cents: number
          contract_address: string
          created_at?: string
          id?: number
          is_refund_triggered?: boolean
          is_refunded?: boolean
          payment_id: string
          user_address: string
        }
        Update: {
          amount_in_cents?: number
          contract_address?: string
          created_at?: string
          id?: number
          is_refund_triggered?: boolean
          is_refunded?: boolean
          payment_id?: string
          user_address?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          id: number
          name: string
          timestamp: number
        }
        Insert: {
          id?: number
          name: string
          timestamp: number
        }
        Update: {
          id?: number
          name?: string
          timestamp?: number
        }
        Relationships: []
      }
      pact: {
        Row: {
          address: string
          blockHash: string | null
          id: string
          name: string
          terms: string
          transactionHash: string
        }
        Insert: {
          address: string
          blockHash?: string | null
          id?: string
          name: string
          terms: string
          transactionHash: string
        }
        Update: {
          address?: string
          blockHash?: string | null
          id?: string
          name?: string
          terms?: string
          transactionHash?: string
        }
        Relationships: []
      }
      portal_index: {
        Row: {
          balance: number
          contract_address: string
          id: number
          isActive: boolean
          jobId: number
          totalFunds: number
          totalRewards: number
        }
        Insert: {
          balance: number
          contract_address: string
          id?: number
          isActive: boolean
          jobId: number
          totalFunds: number
          totalRewards: number
        }
        Update: {
          balance?: number
          contract_address?: string
          id?: number
          isActive?: boolean
          jobId?: number
          totalFunds?: number
          totalRewards?: number
        }
        Relationships: []
      }
      portal_proposals: {
        Row: {
          allowDonationAboveThreshold: boolean
          createdAt: string
          deadline: string | null
          description: string
          fundingGoal: number | null
          fundingGoalWithPlatformFee: number | null
          id: string
          images: string
          isApproved: boolean
          isMultiSignatureReciever: boolean
          isRejected: boolean
          platformFeePercentage: number
          proposerAddress: string
          rejectionComment: string
          sendImmediately: boolean
          slug: string
          tags: string
          termsAndCondition: string
          title: string
          treasurers: string
          updatedAt: string
          user: string | null
        }
        Insert: {
          allowDonationAboveThreshold: boolean
          createdAt?: string
          deadline?: string | null
          description: string
          fundingGoal?: number | null
          fundingGoalWithPlatformFee?: number | null
          id?: string
          images: string
          isApproved?: boolean
          isMultiSignatureReciever: boolean
          isRejected?: boolean
          platformFeePercentage?: number
          proposerAddress: string
          rejectionComment?: string
          sendImmediately?: boolean
          slug: string
          tags: string
          termsAndCondition: string
          title?: string
          treasurers: string
          updatedAt?: string
          user?: string | null
        }
        Update: {
          allowDonationAboveThreshold?: boolean
          createdAt?: string
          deadline?: string | null
          description?: string
          fundingGoal?: number | null
          fundingGoalWithPlatformFee?: number | null
          id?: string
          images?: string
          isApproved?: boolean
          isMultiSignatureReciever?: boolean
          isRejected?: boolean
          platformFeePercentage?: number
          proposerAddress?: string
          rejectionComment?: string
          sendImmediately?: boolean
          slug?: string
          tags?: string
          termsAndCondition?: string
          title?: string
          treasurers?: string
          updatedAt?: string
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FK_bd6e3f039420d9afcc732f4bd82"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["authId"]
          },
        ]
      }
      portals: {
        Row: {
          allowDonationAboveThreshold: boolean
          contract_address: string
          createdAt: string
          deadline: string | null
          description: string
          fundingGoal: number | null
          fundingGoalWithPlatformFee: number | null
          id: string
          images: string
          isMultiSignatureReciever: boolean
          proposer_address: string
          sendImmediately: boolean
          slug: string
          tags: string
          termsAndCondition: string
          title: string
          treasurers: string
          updatedAt: string
          updates: string[] | null
          user: string | null
        }
        Insert: {
          allowDonationAboveThreshold: boolean
          contract_address: string
          createdAt?: string
          deadline?: string | null
          description: string
          fundingGoal?: number | null
          fundingGoalWithPlatformFee?: number | null
          id?: string
          images: string
          isMultiSignatureReciever: boolean
          proposer_address: string
          sendImmediately: boolean
          slug: string
          tags: string
          termsAndCondition: string
          title?: string
          treasurers: string
          updatedAt?: string
          updates?: string[] | null
          user?: string | null
        }
        Update: {
          allowDonationAboveThreshold?: boolean
          contract_address?: string
          createdAt?: string
          deadline?: string | null
          description?: string
          fundingGoal?: number | null
          fundingGoalWithPlatformFee?: number | null
          id?: string
          images?: string
          isMultiSignatureReciever?: boolean
          proposer_address?: string
          sendImmediately?: boolean
          slug?: string
          tags?: string
          termsAndCondition?: string
          title?: string
          treasurers?: string
          updatedAt?: string
          updates?: string[] | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FK_72760c1ba1979d60fbc788c2ceb"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["authId"]
          },
        ]
      }
      portals_comments: {
        Row: {
          comment: string
          created_at: string
          dislikes: string[]
          id: string
          likes: string[]
          parent_id: string | null
          portalId: string | null
          reply_count: number
          user: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          dislikes?: string[]
          id?: string
          likes?: string[]
          parent_id?: string | null
          portalId?: string | null
          reply_count?: number
          user?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          dislikes?: string[]
          id?: string
          likes?: string[]
          parent_id?: string | null
          portalId?: string | null
          reply_count?: number
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FK_0d9f7d87500d9a5ca6eea405996"
            columns: ["portalId"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_4b7b65f7c847ec1c537de47421a"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["authId"]
          },
          {
            foreignKeyName: "FK_9c2fff544ff05ae76da0bed5f6b"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "portals_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      prize: {
        Row: {
          admins: string
          contract_address: string
          created_at: string
          description: string
          id: string
          images: string
          isAutomatic: boolean
          judges: string[] | null
          priorities: string
          proficiencies: string
          proposer_address: string
          slug: string | null
          startSubmissionDate: string | null
          startVotingDate: string | null
          submissionTime: number
          title: string
          updated_at: string
          user: string | null
          votingTime: number
        }
        Insert: {
          admins: string
          contract_address: string
          created_at?: string
          description: string
          id?: string
          images: string
          isAutomatic: boolean
          judges?: string[] | null
          priorities: string
          proficiencies: string
          proposer_address: string
          slug?: string | null
          startSubmissionDate?: string | null
          startVotingDate?: string | null
          submissionTime: number
          title?: string
          updated_at?: string
          user?: string | null
          votingTime: number
        }
        Update: {
          admins?: string
          contract_address?: string
          created_at?: string
          description?: string
          id?: string
          images?: string
          isAutomatic?: boolean
          judges?: string[] | null
          priorities?: string
          proficiencies?: string
          proposer_address?: string
          slug?: string | null
          startSubmissionDate?: string | null
          startVotingDate?: string | null
          submissionTime?: number
          title?: string
          updated_at?: string
          user?: string | null
          votingTime?: number
        }
        Relationships: [
          {
            foreignKeyName: "FK_457605041e9833526c8ce10e8b5"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["authId"]
          },
        ]
      }
      prize_contestants_user: {
        Row: {
          prizeId: string
          userId: string
        }
        Insert: {
          prizeId: string
          userId: string
        }
        Update: {
          prizeId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_232e14de6c577215d9629808c81"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_4421512dd8dcd5ba0759ff3e019"
            columns: ["prizeId"]
            isOneToOne: false
            referencedRelation: "prize"
            referencedColumns: ["id"]
          },
        ]
      }
      prize_proposals: {
        Row: {
          admins: string
          description: string
          id: string
          images: string
          isApproved: boolean
          isAutomatic: boolean | null
          isRejected: boolean
          judges: string[] | null
          platformFeePercentage: number
          priorities: string
          proficiencies: string
          proposerFeePercentage: number
          startSubmissionDate: string | null
          startVotingDate: string | null
          submission_time: number
          title: string
          user: string | null
          voting_time: number
        }
        Insert: {
          admins: string
          description: string
          id?: string
          images: string
          isApproved?: boolean
          isAutomatic?: boolean | null
          isRejected?: boolean
          judges?: string[] | null
          platformFeePercentage?: number
          priorities: string
          proficiencies: string
          proposerFeePercentage?: number
          startSubmissionDate?: string | null
          startVotingDate?: string | null
          submission_time: number
          title?: string
          user?: string | null
          voting_time: number
        }
        Update: {
          admins?: string
          description?: string
          id?: string
          images?: string
          isApproved?: boolean
          isAutomatic?: boolean | null
          isRejected?: boolean
          judges?: string[] | null
          platformFeePercentage?: number
          priorities?: string
          proficiencies?: string
          proposerFeePercentage?: number
          startSubmissionDate?: string | null
          startVotingDate?: string | null
          submission_time?: number
          title?: string
          user?: string | null
          voting_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "FK_5e59db131371ae557edfc20abad"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["authId"]
          },
        ]
      }
      prizes_comments: {
        Row: {
          comment: string
          id: number
          prizeId: string | null
          user: string | null
        }
        Insert: {
          comment: string
          id?: number
          prizeId?: string | null
          user?: string | null
        }
        Update: {
          comment?: string
          id?: number
          prizeId?: string | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FK_228c4254f2cb28242fd5d213f9f"
            columns: ["prizeId"]
            isOneToOne: false
            referencedRelation: "prize"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_61fb29ac6df4ceb134159a8d6ac"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["authId"]
          },
        ]
      }
      submission: {
        Row: {
          created_at: string
          id: string
          prizeId: string | null
          submissionDescription: Json
          submissionHash: string
          submitterAddress: string
          userId: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          prizeId?: string | null
          submissionDescription: Json
          submissionHash: string
          submitterAddress: string
          userId?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          prizeId?: string | null
          submissionDescription?: Json
          submissionHash?: string
          submitterAddress?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FK_08203ca88cf6073248a35a5b57b"
            columns: ["prizeId"]
            isOneToOne: false
            referencedRelation: "prize"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_7bd626272858ef6464aa2579094"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      testing: {
        Row: {
          contract_address: string | null
          created_at: string
          deadline: string | null
          id: number
        }
        Insert: {
          contract_address?: string | null
          created_at?: string
          deadline?: string | null
          id?: number
        }
        Update: {
          contract_address?: string | null
          created_at?: string
          deadline?: string | null
          id?: number
        }
        Relationships: []
      }
      user: {
        Row: {
          authId: string
          avatar: string
          bio: string
          email: string
          id: string
          isAdmin: boolean
          name: string
          priorities: string
          proficiencies: string
          username: string
          walletAddress: string | null
        }
        Insert: {
          authId: string
          avatar?: string
          bio?: string
          email: string
          id?: string
          isAdmin?: boolean
          name: string
          priorities?: string
          proficiencies?: string
          username: string
          walletAddress?: string | null
        }
        Update: {
          authId?: string
          avatar?: string
          bio?: string
          email?: string
          id?: string
          isAdmin?: boolean
          name?: string
          priorities?: string
          proficiencies?: string
          username?: string
          walletAddress?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      converttocron: {
        Args: {
          input_timestamp: string
        }
        Returns: string
      }
      http_post_trigger_deadline: {
        Args: {
          contractaddress: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
