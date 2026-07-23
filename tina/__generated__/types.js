export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const PagePartsFragmentDoc = gql`
    fragment PageParts on Page {
  __typename
  sections {
    __typename
    ... on PageSectionsHero {
      location
      headingLine1
      headingLine2
      subheading
      phoneNumber
      calloutTitle
      calloutText
      proofs {
        __typename
        value
        label
      }
      imageSrc
      imageAlt
      locationVisible
      locationSize
      locationColor
      headingLine1Visible
      headingLine1X
      headingLine1Y
      headingLine1Size
      headingLine1Color
      headingLine2Visible
      headingLine2X
      headingLine2Y
      headingLine2Size
      headingLine2Color
      subheadingVisible
      subheadingX
      subheadingY
      subheadingSize
      subheadingColor
    }
    ... on PageSectionsServices {
      eyebrow
      heading
      copy
      disclaimer
      eyebrowVisible
      eyebrowSize
      eyebrowColor
      headingVisible
      headingX
      headingY
      headingSize
      headingColor
      copyVisible
      copyX
      copyY
      copySize
      copyColor
      disclaimerVisible
      disclaimerX
      disclaimerY
      disclaimerSize
      disclaimerColor
    }
    ... on PageSectionsProcess {
      eyebrow
      heading
      copy
      steps {
        __typename
        number
        title
        description
        image
      }
      eyebrowVisible
      eyebrowSize
      eyebrowColor
      headingVisible
      headingX
      headingY
      headingSize
      headingColor
      copyVisible
      copyX
      copyY
      copySize
      copyColor
    }
    ... on PageSectionsAbout {
      eyebrow
      ownerName
      nameInitial
      tagline
      bioParagraph1
      bioParagraph2
      image
      focalPoint
      eyebrowVisible
      eyebrowSize
      eyebrowColor
      ownerNameVisible
      ownerNameX
      ownerNameY
      ownerNameSize
      ownerNameColor
      bioParagraph1Visible
      bioParagraph1X
      bioParagraph1Y
      bioParagraph1Size
      bioParagraph1Color
      bioParagraph2Visible
      bioParagraph2X
      bioParagraph2Y
      bioParagraph2Size
      bioParagraph2Color
    }
    ... on PageSectionsTestimonials {
      eyebrow
      heading
      copy
      reviews {
        __typename
        quote
        byline
      }
      eyebrowVisible
      eyebrowSize
      eyebrowColor
      headingVisible
      headingX
      headingY
      headingSize
      headingColor
      copyVisible
      copyX
      copyY
      copySize
      copyColor
    }
    ... on PageSectionsContact {
      eyebrow
      heading
      address
      phone
      phoneHref
      email
      emailHref
      hours
      eyebrowVisible
      eyebrowSize
      eyebrowColor
      headingVisible
      headingX
      headingY
      headingSize
      headingColor
      addressVisible
      addressSize
      addressColor
      phoneVisible
      phoneSize
      phoneColor
      emailVisible
      emailSize
      emailColor
      hoursVisible
      hoursSize
      hoursColor
    }
    ... on PageSectionsFooter {
      tagline
      taglineVisible
      taglineX
      taglineY
      taglineSize
      taglineColor
    }
  }
  navigation {
    __typename
    navLinks {
      __typename
      sectionId
      label
      visible
    }
    ctaVisible
    ctaText
    linkFontSize
    linkColor
    linkHoverColor
    linkActiveColor
    linkUppercase
    barBackground
    barBorderColor
    barHeight
    barBlur
  }
}
    `;
export const BookingPartsFragmentDoc = gql`
    fragment BookingParts on Booking {
  __typename
  pricingHub
  previewOpen
  services {
    __typename
    id
    name
    description
    subtitle
    features
    basePriceCents
    pricePerBedroomCents
    pricePerBathroomCents
  }
  addOns {
    __typename
    id
    name
    cents
  }
  theme {
    __typename
    fontFamily
    primaryColor
    backgroundColor
    textColor
    borderRadius
  }
  steps {
    __typename
    title
    description
    disabled
    showIfField
    showIfOperator
    showIfValue
    fields {
      __typename
      ... on BookingStepsFieldsTextInput {
        name
        label
        placeholder
        required
        validationType
      }
      ... on BookingStepsFieldsNumberInput {
        name
        label
        min
        max
      }
      ... on BookingStepsFieldsChoiceInput {
        name
        label
        options {
          __typename
          id
          label
        }
      }
      ... on BookingStepsFieldsDateInput {
        name
        label
      }
      ... on BookingStepsFieldsPhotoUpload {
        label
        prompt
        hint
        selectedText
        emptyText
      }
      ... on BookingStepsFieldsRichTextHeading {
        text
      }
      ... on BookingStepsFieldsServicesSelector {
        question
      }
      ... on BookingStepsFieldsAddonsSelector {
        question
      }
      ... on BookingStepsFieldsEstimateSummary {
        disclaimer
      }
      ... on BookingStepsFieldsImageBlock {
        src
        alt
        caption
        aspect
      }
      ... on BookingStepsFieldsInfoCard {
        title
        description
        icon
        variant
      }
      ... on BookingStepsFieldsInfoBanner {
        text
        type
        dismissible
      }
      ... on BookingStepsFieldsTextareaInput {
        name
        label
        placeholder
        required
        rows
      }
      ... on BookingStepsFieldsSelectInput {
        name
        label
        options {
          __typename
          value
          label
        }
        required
        defaultValue
      }
      ... on BookingStepsFieldsCheckboxGroup {
        name
        label
        options {
          __typename
          value
          label
          priceCents
        }
        required
      }
    }
  }
  header {
    __typename
    badge
    title
    description
  }
  stepNames
  timeWindows {
    __typename
    id
    label
  }
  reviewLabels {
    __typename
    heading
    rowHome
    rowDate
    rowWindow
    rowPhotos
    disclaimer
  }
  navigation {
    __typename
    back
    continue
    submit
  }
  success {
    __typename
    title
    message
    buttonText
  }
  estimate {
    __typename
    label
    customQuote
    disclaimer
  }
}
    `;
export const PageDocument = gql`
    query page($relativePath: String!) {
  page(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PageParts
  }
}
    ${PagePartsFragmentDoc}`;
export const PageConnectionDocument = gql`
    query pageConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PageFilter) {
  pageConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PageParts
      }
    }
  }
}
    ${PagePartsFragmentDoc}`;
export const BookingDocument = gql`
    query booking($relativePath: String!) {
  booking(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...BookingParts
  }
}
    ${BookingPartsFragmentDoc}`;
export const BookingConnectionDocument = gql`
    query bookingConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: BookingFilter) {
  bookingConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...BookingParts
      }
    }
  }
}
    ${BookingPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    page(variables, options) {
      return requester(PageDocument, variables, options);
    },
    pageConnection(variables, options) {
      return requester(PageConnectionDocument, variables, options);
    },
    booking(variables, options) {
      return requester(BookingDocument, variables, options);
    },
    bookingConnection(variables, options) {
      return requester(BookingConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
