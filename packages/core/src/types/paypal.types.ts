import { OrderApplicationContext, OrdersCreateRequest } from "@paypal/checkout-server-sdk/lib/orders/lib"

export interface OAuthV1Response {
    scope: string
    access_token: string
    token_type: string
    app_id: string
    expires_in: number
    nonce: string
}

export type CheckoutPaymentIntent = "CAPTURE" | "AUTHORIZE";
  
export interface OrderV2Payload {
    purchase_units: PurchaseUnit[]
    intent: string
    payer?: Payer
    payment_source: PaymentSource
    application_context?: OrderApplicationContext
}

export interface OrderV2Response {

}
  

type CurrencyAmount = {
    currency_code: string;
    value: string;
  };
  
  type Item = {
    name: string;
    quantity: string;
    description: string;
    sku: string;
    url: string;
    category: "DIGITAL_GOODS";
    image_url: string;
    unit_amount: CurrencyAmount;
    tax: CurrencyAmount;
    upc: {
      type: "UPC-A";
      code: string;
    };
  };
  
  type Address = {
    address_line_1: string;
    address_line_2: string;
    admin_area_2: string;
    admin_area_1: string;
    postal_code: string;
    country_code: string;
  };
  
  type PaymentInstruction = {
    platform_fees: {
      amount: CurrencyAmount;
      payee: {
        email_address: string;
        merchant_id: string;
      };
    }[];
    payee_pricing_tier_id: string;
    payee_receivable_fx_rate_id: string;
    disbursement_mode: "INSTANT";
  };
  
  type Shipping = {
    type: "SHIPPING";
    options: {
      id: string;
      label: string;
      selected: boolean;
      type: "SHIPPING";
      amount: CurrencyAmount;
    }[];
    name: {
      full_name: string;
    };
    address: Address;
    trackers: {
      id: string;
      status: "CANCELLED";
      items: {
        name: string | null;
        quantity: string | null;
        sku: string | null;
        url: string | null;
        image_url: string | null;
        upc: string | null;
      }[];
      links: {
        href: string | null;
        rel: string | null;
        method: string | null;
      }[];
      create_time: string;
      update_time: string;
    }[];
  };
  
  type CardLevel = {
    invoice_id: string;
    tax_total: CurrencyAmount;
  };
  
  type CardLevel3 = {
    ships_from_postal_code: string;
    line_items: {
      name: string | null;
      quantity: string | null;
      description: string | null;
      sku: string | null;
      url: string | null;
      image_url: string | null;
      upc: string | null;
      commodity_code: string | null;
      unit_of_measure: string | null;
      unit_amount: CurrencyAmount | null;
      tax: CurrencyAmount | null;
      discount_amount: CurrencyAmount | null;
      total_amount: CurrencyAmount | null;
    }[];
    shipping_amount: CurrencyAmount;
    duty_amount: CurrencyAmount;
    discount_amount: CurrencyAmount;
    shipping_address: Address;
  };
  
  type SupplementaryData = {
    card: {
      level_2: CardLevel;
      level_3: CardLevel3;
    };
  };
  
  type PaymentAuthorization = {
    status: "CREATED";
    status_details: {
      reason: "PENDING_REVIEW";
    };
    id: string;
    invoice_id: string;
    custom_id: string;
    links: {
      href: string | null;
      rel: string | null;
      method: string | null;
    }[];
    amount: CurrencyAmount;
    network_transaction_reference: {
      id: string;
      date: string;
      acquirer_reference_number: string;
      network: "VISA";
    };
    seller_protection: {
      status: "ELIGIBLE";
      dispute_categories: (string | null)[];
    };
    expiration_time: string;
    create_time: string;
    update_time: string;
    processor_response: {
      avs_code: "A";
      cvv_code: "E";
      response_code: "0000";
      payment_advice_code: "01";
    };
  };
  
  type PaymentCapture = {
    status: "COMPLETED";
    status_details: {
      reason: "BUYER_COMPLAINT";
    };
    id: string;
    invoice_id: string;
    custom_id: string;
    final_capture: boolean;
    disbursement_mode: "INSTANT";
    links: {
      href: string | null;
      rel: string | null;
      method: string | null;
    }[];
    amount: CurrencyAmount;
    network_transaction_reference: {
      id: string;
      date: string;
      acquirer_reference_number: string;
      network: "VISA";
    };
    seller_protection: {
      status: "ELIGIBLE";
      dispute_categories: (string | null)[];
    };
    seller_receivable_breakdown: {
      platform_fees: (string | null)[];
      gross_amount: CurrencyAmount | null;
      paypal_fee: CurrencyAmount | null;
      paypal_fee_in_receivable_currency: CurrencyAmount | null;
      net_amount: CurrencyAmount | null;
      receivable_amount: CurrencyAmount | null;
      exchange_rate: {
        value: string | null;
        source_currency: string | null;
        target_currency: string | null;
      };
    };
    processor_response: {
      avs_code: "A";
      cvv_code: "E";
      response_code: "0000";
      payment_advice_code: "01";
    };
    create_time: string;
    update_time: string;
  };
  
  type PaymentRefund = {
    status: "CANCELLED";
    status_details: {
      reason: "ECHECK";
    };
    id: string;
    invoice_id: string;
    custom_id: string;
    acquirer_reference_number: string;
    note_to_payer: string;
    seller_payable_breakdown: {
      platform_fees: (string | null)[];
      net_amount_breakdown: (string | null)[];
      gross_amount: CurrencyAmount | null;
      paypal_fee: CurrencyAmount | null;
      paypal_fee_in_receivable_currency: CurrencyAmount | null;
      net_amount: CurrencyAmount | null;
      net_amount_in_receivable_currency: CurrencyAmount | null;
      total_refunded_amount: CurrencyAmount | null;
    };
    links: {
      href: string | null;
      rel: string | null;
      method: string | null;
    }[];
    amount: CurrencyAmount;
    payer: {
      email_address: string;
      merchant_id: string;
    };
    create_time: string;
    update_time: string;
  };
  
  type Payments = {
    authorizations: PaymentAuthorization[];
    captures: PaymentCapture[];
    refunds: PaymentRefund[];
  };
  
  type PurchaseUnit = {
    reference_id: string;
    description: string;
    custom_id: string;
    invoice_id: string;
    id: string;
    soft_descriptor: string;
    items: Item[];
    amount: {
      currency_code: string;
      value: string;
      breakdown: {
        item_total: CurrencyAmount;
        shipping: CurrencyAmount;
        handling: CurrencyAmount;
        tax_total: CurrencyAmount;
        insurance: CurrencyAmount;
        shipping_discount: CurrencyAmount;
        discount: CurrencyAmount;
      };
    };
    payee: {
      email_address: string;
      merchant_id: string;
    };
    payment_instruction: PaymentInstruction;
    shipping: Shipping;
    supplementary_data: SupplementaryData;
    payments: Payments;
  };
  
  type PaymentSource = {
    card?: {
      name: string;
      last_digits: string;
      available_networks: string[];
      from_request: {
        last_digits: string;
        expiry: string;
      };
      brand: "VISA";
      type: "CREDIT";
      authentication_result: {
        liability_shift: "NO";
        three_d_secure: {
          authentication_status: "Y";
          enrollment_status: "Y";
        };
      };
      attributes: {
        vault: {
          id: string;
          status: "VAULTED";
          links: {
            href: string;
            rel: string;
            method: "GET";
          }[];
          customer: {
            id: string;
          };
        };
      };
      expiry: string;
      bin_details: {
        bin: string;
        issuing_bank: string;
        products: string[];
        bin_country_code: string;
      };
    };
    bancontact?: {
      card_last_digits: string;
      name: string;
      country_code: string;
      bic: string;
      iban_last_chars: string;
    };
    blik?: {
      name: string;
      country_code: string;
      email: string;
      one_click: {
        consumer_reference: string;
      };
    };
    eps?: {
      name: string;
      country_code: string;
      bic: string;
    };
    giropay?: {
      name: string;
      country_code: string;
      bic: string;
    };
    ideal?: {
      name: string;
      country_code: string;
      bic: string;
      iban_last_chars: string;
    };
    mybank?: {
      name: string;
      country_code: string;
      bic: string;
      iban_last_chars: string;
    };
    p24?: {
      payment_descriptor: string;
      method_id: string;
      method_description: string;
      name: string;
      email: string;
      country_code: string;
    };
    sofort?: {
      name: string;
      country_code: string;
      bic: string;
      iban_last_chars: string;
    };
    trustly?: {
      name: string;
      country_code: string;
      bic: string;
      iban_last_chars: string;
    };
    venmo?: {
      user_name: string;
      attributes: {
        vault: {
          id: string;
          status: "VAULTED";
          links: {
            href: string;
            rel: string;
            method: "GET";
          }[];
          customer: {
            id: string;
          };
        };
      };
      email_address: string;
      account_id: string;
      name: {
        given_name: string;
        surname: string;
      };
      phone_number: {
        national_number: string;
      };
      address: Address;
    };
    paypal?: {
      account_status: "VERIFIED";
      phone_type: "FAX";
      business_name: string;
      attributes: {
        vault: {
          id: string;
          status: "VAULTED";
          links: {
            href: string;
            rel: string;
            method: "GET";
          }[];
          customer: {
            id: string;
            email_address: string;
            phone: {
              phone_type: "FAX";
              phone_number: {
                national_number: string | null;
              };
            };
            merchant_customer_id: string;
          };
        };
        cobranded_cards: {
          labels: string[];
          payee: {
            email_address: string;
            merchant_id: string;
          };
          amount: CurrencyAmount;
        }[];
      };
      email_address: string;
      account_id: string;
      name: {
        given_name: string;
        surname: string;
      };
      phone_number: {
        national_number: string;
      };
      birth_date: string;
      tax_info: {
        tax_id: string;
        tax_id_type: "BR_CPF";
      };
      address: Address;
    };
    apple_pay?: {
      id: string;
      token: string;
      name: string;
      email_address: string;
      phone_number: {
        national_number: string;
      };
      card: {
        name: string;
        last_digits: string;
        available_networks: string[];
        from_request: {
          last_digits: string;
          expiry: string;
        };
        brand: "VISA";
        type: "CREDIT";
        authentication_result: {
          liability_shift: "NO";
          three_d_secure: {
            authentication_status: "Y";
            enrollment_status: "Y";
          };
        };
        attributes: {
          vault: {
            id: string;
            status: "VAULTED";
            links: {
              href: string;
              rel: string;
              method: "GET";
            }[];
            customer: {
              id: string;
            };
          };
        };
        expiry: string;
        bin_details: {
          bin: string;
          issuing_bank: string;
          products: string[];
          bin_country_code: string;
        };
        billing_address: Address;
        country_code: string;
      };
    };
    google_pay?: {
      name: string;
      email_address: string;
      phone_number: {
        country_code: string;
        national_number: string;
      };
      card: {
        name: string;
        last_digits: string;
        type: "CREDIT";
        brand: "VISA";
        billing_address: Address;
        authentication_result: {
          liability_shift: "NO";
          three_d_secure: {
            authentication_status: "Y";
            enrollment_status: "Y";
          };
        };
      };
    };
  };
  
  type Payer = {
    email_address: string;
    payer_id: string;
    name: {
      given_name: string;
      surname: string;
    };
    phone: {
      phone_type: "FAX";
      phone_number: {
        national_number: string;
      };
    };
    birth_date: string;
    tax_info: {
      tax_id: string;
      tax_id_type: "BR_CPF";
    };
    address: Address;
  };
  
  type Link = {
    href: string;
    rel: string;
    method: "GET";
  };
  
export  type PaymentOrder = {
    create_time: string;
    update_time: string;
    id: string;
    processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL";
    purchase_units: PurchaseUnit[];
    links: Link[];
    payment_source: PaymentSource;
    intent: "CAPTURE";
    payer: Payer;
    status: "CREATED";
  };
  



export type VerifyWebhookResponse = {
    verification_status : "SUCCESS" | "FAILURE"
}



  
export  type WebhookEvent = {
    id: string;
    create_time: string;
    resource_type: string;
    event_version: string;
    event_type: string;
    summary: string;
    resource_version: string;
    resource: Record<string, any>;
    links: Link[];
  };
  
 export type WebhookPayload = {
    auth_algo: string;
    cert_url: string;
    transmission_id: string;
    transmission_sig: string;
    transmission_time: string;
    webhook_id: string;
    webhook_event: WebhookEvent;
  };
  




















            
  