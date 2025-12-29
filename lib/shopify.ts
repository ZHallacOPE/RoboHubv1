export const Q_COLLECTIONS = `
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes { id title handle }
    }
  }
`;

export const Q_COLLECTION_BY_HANDLE = `
  query CollectionByHandle($handle: String!, $productsFirst: Int!) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $productsFirst) {
        nodes {
          id
          title
          handle
          availableForSale
          featuredImage { url altText }
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 1) {
            nodes { id title availableForSale }
          }
        }
      }
    }
  }
`;

export const M_CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost { totalAmount { amount currencyCode } }
        lines(first: 50) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

export const M_CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost { totalAmount { amount currencyCode } }
        lines(first: 50) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;
