'use strict'


describe('Image', () => {
  const { Image } = __require('image')

  describe('given an image', () => {
    let image = new Image(F.images('PA140105.JPG').path)

    before(() => image.open())

    it('computes its checksum', () => {
      expect(image.checksum).to.eql('a339d234ec2a6a109d0a75313e06fc49')
    })

    it('computes its mimetype', () => {
      expect(image.mimetype).to.eql('image/jpeg')
    })

    it('computes its title', () => {
      expect(image.title).to.eql('PA140105')
    })

    it('computes its size', () => {
      expect(image).to.have.property('width', 2048)
      expect(image).to.have.property('height', 1536)
    })

    it('computes exif data', () => {
      expect(image.exif[0]).to.contain.keys([
        'http://www.w3.org/2003/12/exif/ns#orientation',
        'http://www.w3.org/2003/12/exif/ns#dateTimeOriginal',
        'http://www.w3.org/2003/12/exif/ns#modifyDate'
      ])
    })

    it('computes file stats', () => {
      expect(image)
        .to.have.property('file')
        .that.contains.keys(['size', 'ctime'])
    })
  })
})
